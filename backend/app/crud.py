# 4. /backend/app/crud.py
#    - DB와 직접 상호작용하는 함수들을 정의

from sqlalchemy.orm import Session
from datetime import date
from . import models

def create_raw_topic(db: Session, topic_text: str):
    db_topic = models.RawTopic(topic_text=topic_text, created_date=date.today())
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    return db_topic

def create_refined_topic(db: Session, topic_text: str):
    db_topic = models.RefinedTopic(topic_text=topic_text, created_date=date.today())
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

def get_summaries_by_date(db: Session, target_date: date):
    return db.query(models.Summary).join(models.RefinedTopic).filter(models.RefinedTopic.created_date == target_date).all()

def get_available_dates(db: Session):
    return db.query(models.RefinedTopic.created_date).distinct().order_by(models.RefinedTopic.created_date.desc()).all()