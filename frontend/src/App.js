import React, { useState, useEffect } from 'react';
import { getSummaries, getAvailableDates } from './api';
import DateSelector from './components/DateSelector'; 
import SummaryCard from './components/SummaryCard';   
import Loading from './components/Loading';     
import Error from './components/Error';
import './index.css';

function App() {
    const [summaries, setSummaries] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null); // 초기값을 null로 변경
    const [loading, setLoading] = useState(true);

    // 사용 가능한 날짜 목록을 가져와서 가장 최신 날짜를 선택하는 로직
    useEffect(() => {
        const fetchDates = async () => {
            const dates = await getAvailableDates();
            if (dates && dates.length > 0) {
                setAvailableDates(dates);
                setSelectedDate(dates[0]); // 가장 최신 날짜를 기본 선택
            } else {
                 setAvailableDates([]);
                 setLoading(false); // 날짜가 없으면 로딩 종료
            }
        };
        fetchDates();
    }, []);

    // 선택된 날짜가 변경될 때마다 해당 날짜의 요약본을 가져오는 로직
    useEffect(() => {
        if (!selectedDate) return;

        const fetchSummaries = async () => {
            setLoading(true);
            const data = await getSummaries(selectedDate);
            setSummaries(data);
            setLoading(false);
        };
        fetchSummaries();
    }, [selectedDate]);

    // 콘텐츠 렌더링 로직
    const renderContent = () => {
        if (loading) {
            return <Loading selectedDate={selectedDate} />;
        }
        if (summaries.length > 0) {
            return summaries.map((summary, index) => <SummaryCard key={index} data={summary} />);
        }
        return <Error />;
    };

    return (
        <div className="container">
            <h1>AI 뉴스 브리핑</h1>
            
            <DateSelector 
                availableDates={availableDates}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
            />

            {renderContent()}
        </div>
    );
}

export default App;