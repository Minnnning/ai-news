# 4. /backend/app/crud.py
#    - DB와 직접 상호작용하는 함수들을 정의

from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import date
from . import models

def create_raw_topic(db: Session, topic_text: str, period: str):
    db_topic = models.RawTopic(topic_text=topic_text, period=period, created_date=date.today())
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    return db_topic

def create_refined_topic(db: Session, topic_text: str, period: str):
    db_topic = models.RefinedTopic(topic_text=topic_text, period=period, created_date=date.today())
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    return db_topic

def create_article(db: Session, topic_id: int, article_data: dict):
    db_article = models.Article(
        topic_id=topic_id,
        title=article_data['title'],
        publisher=article_data['publisher'],
        url=article_data['url'],
        content=article_data['content'],
        published_date=date.today() # 단순화를 위해 오늘 날짜로 저장
    )
    db.add(db_article)
    db.commit()
    db.refresh(db_article)
    return db_article

def create_summary(db: Session, topic_id: int, summary_data: dict):
    db_summary = models.Summary(
        topic_id=topic_id,
        summary_text=summary_data['summary'],
        term_explanation=summary_data['explanation']
    )
    db.add(db_summary)
    db.commit()
    db.refresh(db_summary)
    return db_summary

def get_summaries_by_date_and_period(db: Session, target_date: date, target_period: str):
    return db.query(models.Summary).join(models.RefinedTopic).filter(
        models.RefinedTopic.created_date == target_date,
        models.RefinedTopic.period == target_period
    ).all()

def get_available_date_periods(db: Session):
    # 날짜와 시간대를 함께 조회하고, 최신순으로 정렬
    results = db.query(
        models.RefinedTopic.created_date,
        models.RefinedTopic.period
    ).distinct().order_by(desc(models.RefinedTopic.created_date), desc(models.RefinedTopic.period)).all()
    
    # [{'date': '2025-08-08', 'period': '오후'}, ...] 형태로 데이터 가공
    date_periods = [
        {"date": d.isoformat(), "period": p} for d, p in results
    ]
    return date_periods

def get_article_by_url(db: Session, url: str):
    """URL을 기준으로 기존 기사가 있는지 확인합니다."""
    return db.query(models.Article).filter(models.Article.url == url).first()

def get_available_periods_by_date(db: Session):
    # 날짜별로 저장된 '오전'/'오후' 목록을 조회
    results = db.query(
        models.RefinedTopic.created_date,
        models.RefinedTopic.period
    ).distinct().order_by(desc(models.RefinedTopic.created_date)).all()
    
    # {'2025-08-08': ['오후', '오전'], ...} 형태로 데이터 가공
    periods_by_date = {}
    for d, p in results:
        date_str = d.isoformat()
        if date_str not in periods_by_date:
            periods_by_date[date_str] = []
        periods_by_date[date_str].append(p)
    return periods_by_date