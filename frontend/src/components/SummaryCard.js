import React from 'react';

const SummaryCard = ({ data }) => {
    const hasExplanation = data.explanation && data.explanation.trim() !== "";
    const hasArticles = data.related_articles && data.related_articles.length > 0;

    const renderExplanation = (text) => {
        if (!text) return null;

        return text.split('\n')
            .filter(line => line.trim() !== '')
            .map((line, index) => {
                const match = line.match(/-\s*\*\*(.*?):\*\*(.*)/);
                
                if (match && match[1] && match[2]) {
                    const term = match[1].trim();
                    const description = match[2].trim();
                    return (
                        <p className="explanation-item" key={index}>
                            <strong>{term}</strong> {description}
                        </p>
                    );
                }
                return <p className="explanation-item" key={index}>{line.replace(/-\s*/, '')}</p>;
            });
    };

    // HTML 엔티티 코드를 실제 문자로 변환하는 함수
    const decodeHtml = (html) => {
        if (!html) return "";
        return html.replace(/&quot;/g, '"')
                   .replace(/&apos;/g, "'")
                   .replace(/&amp;/g, "&")
                   .replace(/&lt;/g, "<")
                   .replace(/&gt;/g, ">");
    }

    return (
        <div className="topic-card">
            <h2>토픽: {data.topic}</h2>

            <h3>AI 요약</h3>
            <div className="summary-text">{data.summary}</div>

            {hasExplanation && (
                <details className="collapsible-section">
                    <summary>용어 설명</summary>
                    <div className="explanation-text">
                        {renderExplanation(data.explanation)}
                    </div>
                </details>
            )}

            {hasArticles && (
                <details className="collapsible-section">
                    <summary>요약에 사용된 원문 기사 보기</summary>
                    <ul className="article-list">
                        {data.related_articles.map((article, index) => (
                            <li key={index}>
                                <a href={article.url} target="_blank" rel="noopener noreferrer">
                                    {/* [수정된 부분] decodeHtml 함수를 통해 제목을 변환 */}
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