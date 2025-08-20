import React, { useState, useEffect } from 'react';
import { getSummaries, getAvailableDatePeriods } from './api';
import SummaryCard from './components/SummaryCard';
import Loading from './components/Loading';
import Error from './components/Error';
import DateSelector from './components/DateSelector'; // DateSelector import
import './index.css';

function App() {
    const [summaries, setSummaries] = useState([]);
    const [availableSelections, setAvailableSelections] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0); // 현재 선택된 항목의 인덱스
    const [loading, setLoading] = useState(true);

    // 현재 선택된 항목 객체
    const currentSelection = availableSelections[currentIndex];

    // 초기 데이터 로딩: 날짜/시간대 선택지 목록을 가져옵니다.
    useEffect(() => {
        const fetchInitialData = async () => {
            const selections = await getAvailableDatePeriods();
            setAvailableSelections(selections);
            
            if (!selections || selections.length === 0) {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    // 선택된 항목이 변경될 때마다 요약본 데이터를 가져옵니다.
    useEffect(() => {
        if (!currentSelection) return;

        const fetchSummaries = async () => {
            setLoading(true);
            const data = await getSummaries(currentSelection.date, currentSelection.period);
            setSummaries(data);
            setLoading(false);
        };
        fetchSummaries();
    }, [currentSelection]);

    // 이전 날짜/시간대로 이동하는 함수
    const handlePrev = () => {
        setCurrentIndex(prevIndex => Math.min(availableSelections.length - 1, prevIndex + 1));
    };

    // 다음 날짜/시간대로 이동하는 함수 (인덱스 감소)
    const handleNext = () => {
        setCurrentIndex(prevIndex => Math.max(0, prevIndex - 1));
    };

    const renderContent = () => {
        // availableSelections가 로딩 중일 때도 로딩 표시
        if (availableSelections.length === 0 && loading) {
             return <Loading selectedDate="날짜" />;
        }
        if (loading) {
            return <Loading selectedDate={currentSelection?.date} />;
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
                selection={currentSelection}
                onPrev={handlePrev} // 왼쪽 화살표 (<)
                onNext={handleNext} // 오른쪽 화살표 (>)
                isPrevDisabled={currentIndex >= availableSelections.length - 1} // 가장 오래된 날짜에서 비활성화
                isNextDisabled={currentIndex === 0} // 가장 최신 날짜에서 비활성화
            />

            {renderContent()}
        </div>
    );
}

export default App;