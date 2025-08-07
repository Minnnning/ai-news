import React from 'react';

const DateSelector = ({ availableDates, selectedDate, onDateSelect }) => {
    return (
        <div className="date-selector">
            <h3>날짜 선택</h3>
            {availableDates.length > 0 ? (
                availableDates.map(date => (
                    <button
                        key={date}
                        onClick={() => onDateSelect(date)}
                        className={selectedDate === date ? 'active' : ''}
                    >
                        {date}
                    </button>
                ))
            ) : (
                <p>요약된 뉴스가 아직 없습니다.</p>
            )}
        </div>
    );
};

export default DateSelector;