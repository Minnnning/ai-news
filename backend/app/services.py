# 3. /backend/app/services.py
#    - 실제 데이터 처리 로직을 담당하는 함수들을 정의
import os
import feedparser
import requests
import google.generativeai as genai
from bs4 import BeautifulSoup
from konlpy.tag import Okt

# --- 설정 ---
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
NAVER_CLIENT_ID = os.getenv("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET")
# RSS 피드 주소 목록
RSS_FEEDS = [
    "https://www.yonhapnewstv.co.kr/browse/feed/", # 연합뉴스
    "https://www.hani.co.kr/rss/", # 한겨레
    "https://www.khan.co.kr/rss/rssdata/total_news.xml", # 경향신문
    "https://news-ex.jtbc.co.kr/v1/get/rss/newsflesh", #jtbc 속보
    "https://news-ex.jtbc.co.kr/v1/get/rss/issue", # jtbc 이슈
    "https://news.sbs.co.kr/news/newsflashRssFeed.do?plink=RSSREADER", # sbs 최신
    "https://news.sbs.co.kr/news/headlineRssFeed.do?plink=RSSREADER", # sbs 이시간 이슈
    "https://news.sbs.co.kr/news/TopicRssFeed.do?plink=RSSREADER", # SBS 이시각 인기
    "https://www.chosun.com/arc/outboundfeeds/rss/?outputType=xml", # 조선
    "https://www.hankyung.com/feed/all-news", # 한국경제 전체
    "https://www.hankyung.com/feed/it", # 한국 경제 it
    "https://www.mk.co.kr/rss/40300001/", #매일경제
    # ... 추가하고 싶은 다른 언론사 RSS 주소
]

# --- Step 1: RSS에서 원시 토픽 추출 ---
def fetch_raw_topics_from_rss():
    okt = Okt()
    stopwords = ['오늘', '속보', '사진', '기자', '뉴스', '종합', '단독']
    all_nouns = []
    for url in RSS_FEEDS:
        feed = feedparser.parse(url)
        for entry in feed.entries:
            nouns = okt.nouns(entry.title)
            all_nouns.extend([n for n in nouns if n not in stopwords and len(n) > 1])
    return list(set(all_nouns)) # 중복 제거

# --- Step 2: Gemini로 뉴스 토픽 정제 ---
def refine_topics_with_gemini(raw_topics):
    model = genai.GenerativeModel('gemini-1.5-flash')
    prompt = f'''
    다음은 오늘 뉴스 헤드라인에서 추출한 키워드 목록입니다.
    이 중에서 현재 가장 중요하고 사람들이 관심을 가질 만한 뉴스 검색 토픽 3~5개를 선정해주세요.
    각 토픽은 쉼표(,)로 구분해서 한 줄로만 답변해주세요.

    [키워드 목록]
    {', '.join(raw_topics)}

    [답변 예시]
    부동산 대책,금리 인상,우크라이나 전쟁,신규 전염병,반도체 산업
    '''
    response = model.generate_content(prompt)
    refined_topics = [topic.strip() for topic in response.text.split(',')]
    return refined_topics

# --- Step 3: 네이버 검색 및 BeautifulSoup 스크레이핑 ---
def search_and_scrape_articles(topic_text):
    search_url = f"https://openapi.naver.com/v1/search/news.json?query={topic_text}&display=5&sort=sim"
    headers = {"X-Naver-Client-Id": NAVER_CLIENT_ID, "X-Naver-Client-Secret": NAVER_CLIENT_SECRET}
    
    try:
        response = requests.get(search_url, headers=headers)
        response.raise_for_status()
        items = response.json().get("items", [])
    except requests.exceptions.RequestException as e:
        print(f"네이버 API 요청 실패: {e}")
        return []

    scraped_articles = []
    for item in items:
        article_url = item.get('link')
        if not article_url or 'n.news.naver.com' not in article_url:
            continue # 네이버 뉴스 링크가 아니면 건너뛰기
        
        try:
            article_response = requests.get(article_url, headers={'User-Agent': 'Mozilla/5.0'})
            article_response.raise_for_status()
            soup = BeautifulSoup(article_response.text, 'html.parser')
            
            content_area = soup.find('article', id='dic_area')
            if content_area:
                content = content_area.get_text(separator='\n', strip=True)
                scraped_articles.append({
                    "title": item.get('title').replace('<b>', '').replace('</b>', ''),
                    "url": article_url,
                    "content": content,
                    "publisher": soup.find('meta', property='og:article:author')['content'] if soup.find('meta', property='og:article:author') else '언론사',
                })
        except Exception as e:
            print(f"스크레이핑 실패 ({article_url}): {e}")
            continue
            
    return scraped_articles

# --- Step 4: Gemini로 기사 요약 ---
def summarize_articles_with_gemini(topic_text, articles):
    # --- 이 함수 전체를 아래 코드로 교체해주세요 ---
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        full_text = ""
        for i, article in enumerate(articles):
            full_text += f"--- 기사 {i+1}: {article['title']} ---\n{article['content']}\n\n"

        prompt = f'''
        당신은 핵심을 정확히 파악하는 전문 뉴스 애널리스트입니다.
        아래는 '{topic_text}'와 관련된 여러 기사 본문입니다.

        [기사 묶음]
        {full_text}

        [요청]
        1. 모든 기사의 내용을 종합하여, 이 토픽의 핵심 상황을 3~5문장의 완결된 문단으로 요약해주세요.
        2. 기사에 나온 전문적이거나 어려운 용어 2~3개를 골라, 초등학생도 이해할 수 있도록 쉽게 설명해주세요.
        
        [답변 형식]
        ### 요약 ###
        (여기에 요약 내용 작성)
        ### 용어 설명 ###
        - **용어1:** (쉬운 설명)
        - **용어2:** (쉬운 설명)
        '''
        
        response = model.generate_content(prompt)
        
        # AI의 답변이 안전 설정 등으로 인해 차단되었는지 확인
        if not response.parts:
            print(f"'{topic_text}' 토픽에 대한 AI 응답이 차단되었습니다 (안전 설정 등).")
            return None

        # 응답 텍스트 파싱
        parts = response.text.split("### 용어 설명 ###")
        if len(parts) < 2:
            print(f"'{topic_text}' 토픽에 대한 AI 응답 형식이 올바르지 않습니다.")
            return None # 형식이 맞지 않으면 None 반환

        summary_text = parts[0].replace("### 요약 ###", "").strip()
        term_explanation = parts[1].strip()
        
        return {"summary": summary_text, "explanation": term_explanation}

    except Exception as e:
        # 그 외 모든 예외 상황 처리
        print(f"'{topic_text}' 토픽 요약 중 에러 발생: {e}")
        return None