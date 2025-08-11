import React, { useState, useRef, useEffect, useMemo } from 'react';

// --- [새로운 컴포넌트] 툴팁 ---
const Tooltip = ({ content, position }) => {
    const tooltipRef = useRef(null);
    const [style, setStyle] = useState({
        left: position.x,
        top: position.y,
        opacity: 0,
    });

    useEffect(() => {
        if (tooltipRef.current) {
            const { width, height } = tooltipRef.current.getBoundingClientRect();
            const { innerWidth } = window;
            
            let left = position.x - width / 2;
            let top = position.y - height - 10; // 10px for margin

            // 화면 밖으로 나가지 않도록 위치 조정
            if (left < 0) left = 5;
            if (left + width > innerWidth) left = innerWidth - width - 5;
            if (top < 0) top = position.y + 20;

            setStyle({ left, top, opacity: 1 });
        }
    }, [position]);

    return (
        <div ref={tooltipRef} className="tooltip-bubble" style={style}>
            {content}
        </div>
    );
};

const SummaryCard = ({ data }) => {
    const [tooltip, setTooltip] = useState({ visible: false, content: '', x: 0, y: 0 });

    const explanationMap = useMemo(() => {
        const newMap = new Map();
        if (!data.explanation) return newMap;

        data.explanation.split('\n')
            .filter(line => line.trim().startsWith('- **'))
            .forEach(line => {
                const match = line.match(/-\s*\*\*(.*?):\*\*(.*)/);
                if (match && match[1] && match[2]) {
                    const fullTerm = match[1].trim();
                    const description = match[2].trim();
                    const mainTerm = fullTerm.replace(/\(.*?\)|（.*?）/g, '').trim();
                    
                    newMap.set(mainTerm, description);
                }
            });
        return newMap;
    }, [data.explanation]);

    const handleTermClick = (e, term) => {
        e.stopPropagation();
        const description = explanationMap.get(term);
        if (description) {
            setTooltip({
                visible: true,
                content: description,
                x: e.clientX,
                y: e.clientY,
            });
        }
    };
    
    // --- [수정된 부분] ---
    useEffect(() => {
        const closeTooltip = () => setTooltip(prev => ({ ...prev, visible: false }));

        // 기존 클릭 이벤트 리스너
        window.addEventListener('click', closeTooltip);
        // 화면 스크롤(드래그) 시 툴팁을 닫는 이벤트 리스너 추가
        window.addEventListener('scroll', closeTooltip, true);

        // 컴포넌트가 언마운트될 때 이벤트 리스너들을 정리
        return () => {
            window.removeEventListener('click', closeTooltip);
            window.removeEventListener('scroll', closeTooltip, true);
        };
    }, []); // 빈 배열을 의존성으로 하여 컴포넌트 마운트 시 한 번만 실행
    // ----------------------

    const renderSummaryWithTooltips = () => {
        if (!data.summary) return null;

        const terms = Array.from(explanationMap.keys());
        if (terms.length === 0) {
            return data.summary;
        }

        const regex = new RegExp(`(${terms.join('|')})`, 'g');
        const parts = data.summary.split(regex);
        
        const renderedTerms = new Set();

        return parts.map((part, index) => {
            if (terms.includes(part) && !renderedTerms.has(part)) {
                renderedTerms.add(part);
                return (
                    <strong
                        key={index}
                        className="term-highlight"
                        onClick={(e) => handleTermClick(e, part)}
                    >
                        {part}
                    </strong>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };
    
    const decodeHtml = (html) => {
        if (!html) return "";
        return html.replace(/&quot;/g, '"');
    }

    return (
        <div className="topic-card">
            {tooltip.visible && <Tooltip content={tooltip.content} position={{ x: tooltip.x, y: tooltip.y }} />}
            
            <h2>토픽: {data.topic}</h2>
            
            <h3>AI 요약</h3>
            <div className="summary-text">{renderSummaryWithTooltips()}</div>

            {data.related_articles?.length > 0 && (
                <details className="collapsible-section">
                    <summary>요약에 사용된 원문 기사 보기</summary>
                    <ul className="article-list">
                        {data.related_articles.map((article, index) => (
                            <li key={index}>
                                <a href={article.url} target="_blank" rel="noopener noreferrer">
                                    {decodeHtml(article.title)}
                                </a>
                            </li>
                        ))}
                    </ul>
                </details>
            )}
        </div>
    );
};

export default SummaryCard;