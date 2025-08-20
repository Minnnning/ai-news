🤖 AI 뉴스 브리핑 서비스 (AI News Briefing Service)
매일 쏟아지는 뉴스, 이 프로젝트는 바쁜 현대인을 위해 AI가 매일의 핵심 이슈를 자동으로 요약하고 어려운 개념까지 쉽게 풀어주는 뉴스 요약 웹 서비스입니다.

## 🎯 프로젝트 목적 및 목표
뉴스를 자주 보지 않으면 사회의 중요한 흐름을 놓치기 쉽습니다. 이 서비스는 이러한 '정보 격차' 문제를 해결하는 것을 가장 큰 목표로 삼았습니다. 사용자가 단 몇 분만 투자해도 그날의 가장 중요한 이슈가 무엇인지, 그리고 그 이면에 담긴 의미는 무엇인지를 쉽고 빠르게 파악할 수 있도록 돕기 위해 만들어졌습니다.

자동화된 이슈 트래킹: 여러 언론사의 RSS 피드를 종합하여 그날 가장 많이 언급되는 '핫 토픽'을 자동으로 추출합니다. -> 제목을 가지고 ai에게 핫토픽 추출

뉴스 검색: 정제된 핫토픽을 이용해서 네이버 뉴스 api를 통해서 관련 뉴스를 검색 합니다.

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
### version 1: rss 분석으로 나온 토픽들이 현재 상황(오늘의 이슈)과 맞지 않는 경우가 많아서 개선이 필요
기존 제목에서 단어(구 추출도 해봄)를 추출 후 단어의 개수를 conter로 체크 제일 많은 빈도수로 핫토픽을 선정했지만 같은 단어지만 의미가 다르고 정확성이 매우 떨어졌음
<center><img src="https://image.minnnning.kr/images/47cbcc2d-906c-4768-b59a-337a34e33e78.webp" style="zoom:20%;"></center>
&nbsp;

### version 2: 제목 그대로를 이용해서 ai에게 핫토픽 추출 방식으로 변경
기존 방법에서 단어 임베딩을 이용해서 관련도 높은 단어나 구를 묶어서 해볼려 했지만 단어 임베딩이 컴퓨팅 자원을 많이 소모하기 때문에 version2 방법을 이용
&nbsp;

### version 3: ui 변경 용어 정리, 원본 기사 url등
프론트엔드 변경 + gemini-api를 이용하는 과정에서 리미트에 걸리는 경우가 생겨 로컬에 gemini cil를 실행시켜 cli를 이용해서 ai를 사용함
<center><img src="https://image.minnnningn.kr/images/e92c3956-385d-4c59-a3e4-284bf0bbe2c1.webp" style="zoom:20%;"></center>
<center><img src="https://image.minnnning.kr/images/be1e3222-df73-4879-9a0e-cc0201633bda.webp" style="zoom:20%;"></center>

하루 2번 오전 오후 기사 수집 및 요약
모바일 뷰 대응
<table><td><center><img alt="원래" src="https://image.minnnning.kr/images/1ffb2c77-1ee6-4f57-9ba3-64665275e66e.webp" style="zoom:20%;" /></center></td><td><center> ➡️ </center></td><td><center><img alt="" src="https://image.minnnning.kr/images/3a4763d0-7254-4614-9c53-44c56b0b862f.webp" style="zoom:20%;" /></center></td></table>

&nbsp;
단어 설명기능 툴팁 추가
<center><img src="https://image.minnnning.kr/images/18f04a33-dd9e-48b1-ba71-23eccd19897b.webp" style="zoom:20%;"></center>

&nbsp;
날짜 선택창 변경
<center><img src="https://image.minnnning.kr/images/bbc70343-1c11-4b7a-9e33-e52e7d2e1254.webp" style="zoom:20%;"></center>