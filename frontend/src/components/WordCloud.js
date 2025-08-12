import React, { useState, useEffect, useCallback } from 'react';
import WordCloud from 'react-d3-cloud'; // 'react-d3-cloud'로 변경
import { getWordCloudData } from '../api';

const WordCloudComponent = ({ selection }) => {
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!selection) return;

        const fetchWords = async () => {
            setLoading(true);
            const data = await getWordCloudData(selection.date, selection.period);
            setWords(data);
            setLoading(false);
        };

        fetchWords();
    }, [selection]);

    // 폰트 크기를 빈도수에 따라 동적으로 조절하는 함수 (크기 축소)
    const fontSizeMapper = useCallback((word) => Math.log2(word.value) * 5 + 15, []);
    
    // 단어 회전 방지 (모든 단어를 가로로 표시)
    const rotate = useCallback(() => 0, []);

    if (loading) return <div className="loading">키워드 분석 중...</div>;
    // 데이터가 10개 미만이어도 모두 표시되도록 조건 수정
    if (!words || words.length === 0) return null;

    return (
        <div className="wordcloud-container">
            <h3>오늘의 키워드</h3>
            <div className="wordcloud-wrapper">
                <WordCloud
                    data={words}
                    width={500} // 너비와 높이는 부모 요소에 맞게 조절됩니다.
                    height={300}
                    font="sans-serif"
                    fontSize={fontSizeMapper}
                    rotate={rotate}
                    padding={2}
                    spiral="rectangular"
                    // onWordClick={(event, d) => { console.log(`'${d.text}' clicked`); }}
                />
            </div>
        </div>
    );
};

export default WordCloudComponent;