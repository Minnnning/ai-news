# 5. /backend/app/main.py
#    - FastAPI 앱을 설정하고, API 엔드포인트와 자동화 스케줄러를 정의
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from apscheduler.schedulers.background import BackgroundScheduler
from fastapi.middleware.cors import CORSMiddleware
from datetime import date
import time, os
from . import crud, models, services_gemini_api
from .database import engine, get_db

# DB 테이블 생성
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# 허용할 출처 목록
origins = [
    "http://localhost:3000", # React 개발 서버 주소
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # origins 목록에 있는 출처의 요청을 허용
    allow_credentials=True,      # 쿠키를 포함한 요청을 허용
    allow_methods=["*"],         # 모든 HTTP 메소드(GET, POST 등)를 허용
    allow_headers=["*"],         # 모든 HTTP 헤더를 허용
)

def full_news_pipeline():
    print("===== 전체 뉴스 처리 파이프라인 시작 =====")
    db: Session = next(get_db())
    try:
        # Step 1: RSS에서 원시 토픽 추출
        raw_topics = services_gemini_api.fetch_raw_topics_from_rss()
        for raw_topic in raw_topics:
            crud.create_raw_topic(db, topic_text=raw_topic)
        print(f"추출된 원시 토픽: {raw_topics}")

        # Step 2: Gemini로 뉴스 토픽 정제
        refined_topics = services_gemini_api.refine_topics_with_gemini(raw_topics)
        print(f"정제된 토픽: {refined_topics}")
        time.sleep(5)

        for topic_text in refined_topics:
            # Step 3: 토픽 저장 및 기사 검색/스크레이핑
            db_topic = crud.create_refined_topic(db, topic_text=topic_text)
            articles_data = services_gemini_api.search_and_scrape_articles(topic_text)
            print(f"'{topic_text}' 토픽에 대해 {len(articles_data)}개의 기사 수집 완료")

            if not articles_data:
                continue
            
            for article_data in articles_data:
                # DB에 해당 URL의 기사가 이미 있는지 확인
                existing_article = crud.get_article_by_url(db, url=article_data['url'])
                
                if existing_article:
                    # 이미 존재하면, 새로 저장하지 않고 건너뜁니다.
                    print(f"이미 존재하는 기사입니다 (저장 건너뛰기): {article_data['url']}")
                else:
                    # 존재하지 않으면, 새로 생성합니다.
                    print(f"새로운 기사를 저장합니다: {article_data['url']}")
                    crud.create_article(db, topic_id=db_topic.id, article_data=article_data)
            
            # Step 4: Gemini로 기사 요약 및 저장
            summary_data = services_gemini_api.summarize_articles_with_gemini(topic_text, articles_data)
            # summary_data가 유효한 경우에만 DB에 저장합니다.
            if summary_data:
                crud.create_summary(db, topic_id=db_topic.id, summary_data=summary_data)
                print(f"'{topic_text}' 토픽 요약 완료 및 저장")
            else:
                print(f"'{topic_text}' 토픽에 대한 요약 생성에 실패하여 건너뜁니다.")

            print("API 속도 제한을 위해 5초 대기합니다...")
            time.sleep(5)

    finally:
        db.close()
        print("===== 전체 뉴스 처리 파이프라인 종료 =====")

scheduler = BackgroundScheduler()
# 환경 변수에서 시간 설정 읽어오기 (값이 없으면 기본값으로 새벽 4시 0분 UTC 사용)
cron_hour = int(os.getenv('CRON_HOUR', '4'))
cron_minute = int(os.getenv('CRON_MINUTE', '0'))

scheduler.add_job(full_news_pipeline, 'cron', hour=cron_hour, minute=cron_minute)
scheduler.start()

# API 엔드포인트
@app.get("/api/summaries")
def read_summaries(target_date: date = date.today(), db: Session = Depends(get_db)):
    summaries = crud.get_summaries_by_date(db, target_date=target_date)
    results = []
    for s in summaries:
        results.append({
            "topic": s.topic.topic_text,
            "summary": s.summary_text,
            "explanation": s.term_explanation
        })
    return results

@app.get("/api/available-dates")
def read_available_dates(db: Session = Depends(get_db)):
    dates = crud.get_available_dates(db)
    return [d[0] for d in dates]

@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()