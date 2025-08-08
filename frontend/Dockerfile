FROM node:18-alpine AS builder

WORKDIR /app

# 의존성 설치
COPY package.json ./
RUN npm install

# 소스 코드 복사 및 프로덕션 빌드 실행
COPY . .
RUN npm run build

# --- STAGE 2: Nginx로 정적 파일 서비스 ---
# 가벼운 Nginx 이미지를 최종 서비스 단계로 사용
FROM nginx:stable-alpine

# builder 단계에서 생성된 빌드 결과물(/app/build)을
# Nginx의 기본 웹 루트 디렉토리(/usr/share/nginx/html)로 복사
COPY --from=builder /app/build /usr/share/nginx/html

# Nginx 컨테이너는 기본적으로 80 포트를 사용
EXPOSE 80

# Nginx 서버 실행
CMD ["nginx", "-g", "daemon off;"]