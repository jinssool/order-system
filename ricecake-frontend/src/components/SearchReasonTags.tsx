// src/components/SearchReasonTags.tsx
import React from 'react';

interface SearchReasonTagsProps {
  reasons: string[];
}

const SearchReasonTags: React.FC<SearchReasonTagsProps> = ({ reasons }) => {
  if (!reasons || reasons.length === 0) {
    return null;
  }

  const getTagStyle = (reason: string) => {
    switch (reason) {
      case '고객명':
        return 'search-reason-tag customer';
      case '떡종류':
        return 'search-reason-tag ricecake';
      case '메모':
        return 'search-reason-tag memo';
      default:
        return 'search-reason-tag';
    }
  };

  const getTagIcon = (reason: string) => {
    switch (reason) {
      case '고객명':
        return '👤';
      case '떡종류':
        return '🍡';
      case '메모':
        return '📝';
      default:
        return '🔍';
    }
  };

  return (
    <div className="search-reason-tags">
      {reasons.map((reason, index) => (
        <span key={index} className={getTagStyle(reason)}>
          <span className="tag-icon">{getTagIcon(reason)}</span>
          <span className="tag-text">{reason}</span>
        </span>
      ))}
    </div>
  );
};

export default SearchReasonTags;
