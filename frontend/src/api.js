// 1. /frontend/src/api.js
//    - 백엔드와 통신하는 함수를 정의

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api'; // 개발 환경

export const getSummaries = async (date, period) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/summaries`, {
            params: { 
                target_date: date,
                target_period: period 
            }
        });
        return response.data;
    } catch (error) {
        console.error("요약 데이터를 가져오는 데 실패했습니다.", error);
        return [];
    }
};

export const getAvailablePeriods = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/available-periods`);
        return response.data;
    } catch (error) {
        console.error("날짜/시간대 목록을 가져오는 데 실패했습니다.", error);
        return {};
    }
};