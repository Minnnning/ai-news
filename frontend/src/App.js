import React, { useState, useEffect } from 'react';
import { getSummaries, getAvailablePeriods } from './api';
import SummaryCard from './components/SummaryCard';
import Loading from './components/Loading';
import Error from './components/Error';
import './index.css';

function App() {
    const [summaries, setSummaries] = useState([]);
    const [availablePeriods, setAvailablePeriods] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            const periodsData = await getAvailablePeriods();
            setAvailablePeriods(periodsData);
            
            const dates = Object.keys(periodsData);
            if (dates.length > 0) {
                const latestDate = dates.sort().reverse()[0];
                setSelectedDate(latestDate);
                // 해당 날짜의 첫 번째 시간대(오후/오전 순)를 기본 선택
                setSelectedPeriod(periodsData[latestDate][0]);
            } else {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (!selectedDate || !selectedPeriod) return;

        const fetchSummaries = async () => {
            setLoading(true);
            const data = await getSummaries(selectedDate, selectedPeriod);
            setSummaries(data);
            setLoading(false);
        };
        fetchSummaries();
    }, [selectedDate, selectedPeriod]);

    const renderContent = () => {
        if (loading) {
            return <Loading selectedDate={selectedDate} />;
        }
        if (summaries.length > 0) {
            return summaries.map((summary, index) => <SummaryCard key={index} data={summary} />);
        }
        return <Error />;
    };

    const availableDates = Object.keys(availablePeriods).sort().reverse();

    return (
        <div className="container">
            <h1>AI 뉴스 브리핑</h1>
            
            <div className="date-selector">
                <h3>날짜 선택</h3>
                {availableDates.length > 0 ? (
                    availableDates.map(date => (
                        <button 
                            key={date} 
                            onClick={() => {
                                setSelectedDate(date);
                                // 날짜 변경 시 해당 날짜의 첫 번째 시간대를 기본 선택
                                setSelectedPeriod(availablePeriods[date][0]);
                            }}
                            className={selectedDate === date ? 'active' : ''}
                        >
                            {date}
                        </button>
                    ))
                ) : (
                    !loading && <p>요약된 뉴스가 아직 없습니다.</p>
                )}
            </div>

            {selectedDate && (
                <div className="period-selector">
                    {availablePeriods[selectedDate]?.map(period => (
                        <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={selectedPeriod === period ? 'active' : ''}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            )}

            {renderContent()}
        </div>
    );
}

export default App;