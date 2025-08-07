import React, { useState, useEffect } from 'react';
import { getSummaries, getAvailableDatePeriods } from './api';
import SummaryCard from './components/SummaryCard';
import Loading from './components/Loading';
import Error from './components/Error';
import './index.css';

function App() {
    const [summaries, setSummaries] = useState([]);
    const [availableSelections, setAvailableSelections] = useState([]); // 통합된 선택지 상태
    const [currentSelection, setCurrentSelection] = useState(null); // 현재 선택된 항목 상태
    const [loading, setLoading] = useState(true);

    // 초기 데이터 로딩: 날짜/시간대 선택지 목록을 가져옵니다.
    useEffect(() => {
        const fetchInitialData = async () => {
            const selections = await getAvailableDatePeriods();
            setAvailableSelections(selections);
            
            if (selections && selections.length > 0) {
                // 가장 첫 번째 항목 (최신 날짜/시간대)을 기본 선택으로 설정
                setCurrentSelection(selections[0]);
            } else {
                setLoading(false); // 데이터가 없으면 로딩 종료
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

    const renderContent = () => {
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
            
            <div className="date-selector">
                <h3>날짜 및 시간대 선택</h3>
                {availableSelections.length > 0 ? (
                    availableSelections.map((selection, index) => (
                        <button 
                            key={index} 
                            onClick={() => setCurrentSelection(selection)}
                            className={
                                currentSelection &&
                                currentSelection.date === selection.date &&
                                currentSelection.period === selection.period
                                ? 'active' : ''
                            }
                        >
                            {`${selection.date} ${selection.period}`}
                        </button>
                    ))
                ) : (
                    !loading && <p>요약된 뉴스가 아직 없습니다.</p>
                )}
            </div>

            {/* period-selector div는 이제 필요 없으므로 제거됩니다. */}

            {renderContent()}
        </div>
    );
}

export default App;