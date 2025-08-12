import React, { useState, useEffect } from 'react';
import { getSummaries, getAvailableDatePeriods } from './api';
import SummaryCard from './components/SummaryCard';
import Loading from './components/Loading';
import Error from './components/Error';
import WordCloudComponent from './components/WordCloud'; // 이름 변경
import './index.css';

function App() {
    const [summaries, setSummaries] = useState([]);
    const [availableSelections, setAvailableSelections] = useState([]);
    const [currentSelection, setCurrentSelection] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            const selections = await getAvailableDatePeriods();
            setAvailableSelections(selections);
            
            if (selections && selections.length > 0) {
                setCurrentSelection(selections[0]);
            } else {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

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

            {currentSelection && <WordCloudComponent selection={currentSelection} />}

            {renderContent()}
        </div>
    );
}

export default App;