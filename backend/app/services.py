# /backend/app/services.py

import os
import feedparser
import requests # Gemini 대신 requests를 사용합니다.
from bs4 import BeautifulSoup

# --- 설정 ---
NAVER_CLIENT_ID = os.getenv("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET")
LOCAL_AI_URL = os.getenv("LOCAL_AI_URL")

# RSS 피드 주소 목록
RSS_FEEDS = [
    "https://www.yonhapnewstv.co.kr/browse/feed/",
    "https://www.hani.co.kr/rss/",
    "https://www.khan.co.kr/rss/rssdata/total_news.xml",
    "https://news-ex.jtbc.co.kr/v1/get/rss/issue",
    "https://www.hankyung.com/feed/all-news",
    "https://www.hankyung.com/feed/it",
]

# --- 로컬 AI 서버에 요청을 보내는 헬퍼 함수 ---
def _query_local_ai(prompt: str):
    """주어진 프롬프트를 로컬 AI 서버로 보내고 응답 텍스트를 받습니다."""
    try:
        # POST 요청으로 body에 prompt를 담아 보냅니다.
        response = requests.post(LOCAL_AI_URL, json={"prompt": prompt}, timeout=180) # 타임아웃을 넉넉하게 설정
        response.raise_for_status() # 200번대 응답이 아니면 에러 발생
        return response.text # 순수 텍스트 응답을 반환
    except requests.exceptions.RequestException as e:
        print(f"로컬 AI 서버 요청 실패: {e}")
        return None

# --- Step 1: RSS에서 원시 토픽 추출 ---
def fetch_raw_topics_from_rss():
    all_title = []
    print("RSS 피드에서 제목 추출을 시작합니다...")
    for url in RSS_FEEDS:
        try:
            feed = feedparser.parse(url)
            for entry in feed.entries:
                all_title.append(entry.title)
        except Exception as e:
            print(f"{url} 피드 처리 중 오류 발생: {e}")
            continue
    return all_title if all_title else []

# --- Step 2: 로컬 AI로 뉴스 토픽 정제 ---
def refine_topics_with_gemini(raw_topics):
    prompt = f'''
    다음은 오늘 뉴스 헤드라인에서 추출한 제목 목록입니다.
    이 중에서 현재 가장 중요(빈도수가 높음)하고 내가 관심을 가질 만한 뉴스 검색 단어 10개를 선정해주세요.
    난 it에 관심이 많고 세계, 사회 순서로 관심이 있다.
    이 단어를 이용해서 다시 기사를 검색할 예정입니다 그렇기 때문에 같은 제목에 있는 단어나 유사한 단어는 최소화 해주세요.
    그렇지 않다면 기사 검색시 중복된 기사가 포함 될 수 있습니다.
    각 토픽은 쉼표(,)로 구분해서 한 줄로만 답변해주세요.

    [키워드 목록]
    {', '.join(raw_topics)}

    [답변 예시]
    A, B, C, D, E
    '''
    
    # Gemini API 대신 로컬 AI 서버 호출
    response_text = _query_local_ai(prompt)
    
    if not response_text:
        print("로컬 AI로부터 토픽 정제 응답을 받지 못했습니다.")
        return []
        
    refined_topics = [topic.strip() for topic in response_text.split(',')]
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
            continue
        
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

# --- Step 4: 로컬 AI로 기사 요약 ---
def summarize_articles_with_gemini(topic_text, articles):
    full_text = ""
    for i, article in enumerate(articles):
        full_text += f"--- 기사 {i+1}: {article['title']} ---\n{article['content']}\n\n"

    prompt = f'''
    당신은 핵심을 정확히 파악하는 전문 뉴스 애널리스트입니다.
    아래는 '{topic_text}'와 관련된 여러 기사 본문입니다.

    [기사 묶음]
    {full_text}

    [요청]
    1. 모든 기사의 내용을 종합하여, 이 토픽의 핵심 상황을 완결된 문단으로 요약해주세요.
    2. 내용이 조금 길더라도 이해하는데 부족함이 없도록 요약해주세요.
    3. 기사에 나온 전문적이거나 어려운 용어를 골라, 초등학생도 이해할 수 있도록 쉽게 설명해주세요.
    
    [답변 형식]
    ### 요약 ###
    (여기에 요약 내용 작성)
    ### 용어 설명 ###
    - **용어1:** (쉬운 설명)
    - **용어2:** (쉬운 설명)
    '''
    
    # Gemini API 대신 로컬 AI 서버 호출
    response_text = _query_local_ai(prompt)

    if not response_text:
        print(f"'{topic_text}' 토픽에 대한 로컬 AI 응답이 없습니다.")
        return None

    # 응답 텍스트 파싱
    parts = response_text.split("### 용어 설명 ###")
    if len(parts) < 2:
        print(f"'{topic_text}' 토픽에 대한 로컬 AI 응답 형식이 올바르지 않습니다.")
        return None

    summary_text = parts[0].replace("### 요약 ###", "").strip()
    term_explanation = parts[1].strip()
    
    return {"summary": summary_text, "explanation": term_explanation}
