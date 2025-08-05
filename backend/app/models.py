# /backend/app/models.py  <- 이 파일의 전체 내용이 아래와 같아야 합니다.

from sqlalchemy import Column, Integer, String, Text, Date, func, ForeignKey
from sqlalchemy.orm import relationship

from .database import Base

class RawTopic(Base):
    __tablename__ = "raw_topics"
    id = Column(Integer, primary_key=True)
    topic_text = Column(String, index=True)
    created_date = Column(Date, server_default=func.current_date())

class RefinedTopic(Base):
    __tablename__ = "refined_topics"
    id = Column(Integer, primary_key=True)
    topic_text = Column(String, index=True)
    created_date = Column(Date, server_default=func.current_date())
    
    articles = relationship("Article", back_populates="topic")
    summary = relationship("Summary", uselist=False, back_populates="topic")

class Article(Base):
    __tablename__ = "articles"
    id = Column(Integer, primary_key=True)
    title = Column(String)
    publisher = Column(String, nullable=True)
    url = Column(String, unique=True)
    content = Column(Text)
    published_date = Column(Date)
    
    topic_id = Column(Integer, ForeignKey("refined_topics.id"))
    topic = relationship("RefinedTopic", back_populates="articles")

class Summary(Base):
    __tablename__ = "summaries"
    id = Column(Integer, primary_key=True)
    summary_text = Column(Text)
    term_explanation = Column(Text)
    
    topic_id = Column(Integer, ForeignKey("refined_topics.id"), unique=True)
    topic = relationship("RefinedTopic", back_populates="summary")