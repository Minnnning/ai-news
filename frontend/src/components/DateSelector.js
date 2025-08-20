import React from 'react';

const DateSelector = ({ selection, onPrev, onNext, isPrevDisabled, isNextDisabled }) => {
    return (
        <div className="date-selector">
            <h3>날짜 및 시간대 선택</h3>
            <div className="date-navigator">
                <button onClick={onPrev} disabled={isPrevDisabled} aria-label="Previous Date">
                    &lt;
                </button>
                <span className="current-date">
                    {selection ? `${selection.date} ${selection.period}` : '로딩...'}
                </span>
                <button onClick={onNext} disabled={isNextDisabled} aria-label="Next Date">
                    &gt;
                </button>
            </div>
        </div>
    );
};

export default DateSelector;