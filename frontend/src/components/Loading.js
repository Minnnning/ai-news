import React from 'react';

const Loading = ({ selectedDate }) => {
    return (
        <div className="loading">'{selectedDate}'의 뉴스를 불러오는 중...</div>
    );
};

export default Loading;