// 3. /frontend/src/App.js
//    - 날짜별 토픽을 보여주는 메인 UI 컴포넌트
import React, { useState, useEffect } from 'react';
import { getSummaries, getAvailableDates } from './api';

function App() {
    const [summaries, setSummaries] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDates = async () => {
            const dates = await getAvailableDates();
            setAvailableDates(dates);
        };
        fetchDates();
    }, []);

    useEffect(() => {
        const fetchSummaries = async () => {
            setLoading(true);
            const data = await getSummaries(selectedDate);
            setSummaries(data);
            setLoading(false);
        };
        fetchSummaries();
    }, [selectedDate]);

    const SummaryCard = ({ data }) => (
        <div className="topic-card">
            <h2>토픽: {data.topic}</h2>
            
            <h3>AI 요약</h3>
            <div className="summary-text">{data.summary}</div>

            <h3>용어 설명</h3>
            <div className="explanation-text">{data.explanation}</div>
        </div>
    );

    return (
        <div className="container">
            <h1>AI 뉴스 브리핑</h1>
            
            <div className="date-selector">
                <h3>날짜 선택</h3>
                {availableDates.map(date => (
                    <button 
                        key={date} 
                        onClick={() => setSelectedDate(date)}
                        className={selectedDate === date ? 'active' : ''}
                    >
                        {date}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading">'{selectedDate}'의 뉴스를 불러오는 중...</div>
            ) : summaries.length > 0 ? (
                summaries.map((summary, index) => <SummaryCard key={index} data={summary} />)
            ) : (
                <div className="error">해당 날짜의 요약된 뉴스가 없습니다.</div>
            )}
        </div>
    );
}

export default App;