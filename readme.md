🤖 AI 뉴스 브리핑 서비스 (AI News Briefing Service)
매일 쏟아지는 뉴스, 이 프로젝트는 바쁜 현대인을 위해 AI가 매일의 핵심 이슈를 자동으로 요약하고 어려운 개념까지 쉽게 풀어주는 뉴스 요약 웹 서비스입니다.

## 🎯 프로젝트 목적 및 목표
뉴스를 자주 보지 않으면 사회의 중요한 흐름을 놓치기 쉽습니다. 이 서비스는 이러한 '정보 격차' 문제를 해결하는 것을 가장 큰 목표로 삼았습니다. 사용자가 단 몇 분만 투자해도 그날의 가장 중요한 이슈가 무엇인지, 그리고 그 이면에 담긴 의미는 무엇인지를 쉽고 빠르게 파악할 수 있도록 돕기 위해 만들어졌습니다.

자동화된 이슈 트래킹: 여러 언론사의 RSS 피드를 종합하여 그날 가장 많이 언급되는 '핫 토픽'을 자동으로 추출합니다.

AI 기반 심층 요약: Google Gemini AI가 여러 관련 기사를 종합적으로 분석하여, 단편적인 사실 나열을 넘어 사건의 전체적인 맥락을 담은 하나의 완성된 스토리로 요약합니다.

개념 해설을 통한 이해 증진: 뉴스에 등장하는 어려운 전문 용어나 배경 지식을 AI가 직접 풀어서 설명해주어 사용자의 깊이 있는 이해를 돕습니다.

## ✨ 주요 기능
일자별 토픽 브리핑: 메인 화면에서 오늘 날짜의 핵심 토픽과 요약본을 바로 확인할 수 있습니다.

과거 뉴스 아카이브: 날짜 선택 기능을 통해 지난 날짜의 주요 이슈들을 손쉽게 다시 찾아볼 수 있습니다.

자동화된 콘텐츠 생성: 매일 정해진 시간에 AI 파이프라인이 자동으로 그날의 모든 콘텐츠를 생성하고 데이터베이스에 저장합니다.

## 🛠️ 기술 스택
Backend: Python, FastAPI, SQLAlchemy

Frontend: JavaScript, React

Database: PostgreSQL

AI Model: Google Gemini

Infrastructure: Docker, Docker Compose

Core Libraries: APScheduler, feedparser, BeautifulSoup4, KoNLPy

&nbsp;
## 개발 진행
#### version 1: rss 분석으로 나온 토픽들이 현재 상황(오늘의 이슈)과 맞지 않는 경우가 많아서 개선이 필요
<center><img src="https://image.minnnningnas.duckdns.org/images/47cbcc2d-906c-4768-b59a-337a34e33e78.webp" style="zoom:20%;"></center>