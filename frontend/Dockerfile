# --- STAGE 1: React 앱 빌드 ---
FROM node:18-alpine AS builder
WORKDIR /app

# 빌드 인자(build argument)로 받을 변수를 선언합니다.
ARG REACT_APP_API_BASE_URL
# 받은 빌드 인자를 빌드 과정에서 사용할 환경 변수로 설정합니다.
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# --- STAGE 2: Nginx로 정적 파일 서비스 ---
FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
