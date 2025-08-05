FROM python:3.10-slim

# 시스템 패키지 및 Java 설치
RUN apt-get update && apt-get install -y --no-install-recommends \
    default-jdk \
    && rm -rf /var/lib/apt/lists/*

# 의존성 설치
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# 소스 코드 복사 (app 디렉토리 자체를 /code 아래에 복사)
COPY ./app /code/app

# 작업 디렉토리를 /code로 변경
WORKDIR /code

# 서버 실행 (app.main:app 형태로 실행하여 app이 패키지임을 명시)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]