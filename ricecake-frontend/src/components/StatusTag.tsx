// src/components/StatusTag.tsx

interface StatusTagProps {
    label: string; // 태그에 표시될 글자 (예: "결제 완료")
    type: 'success' | 'warning' | 'info'; // 태그 색상을 결정할 타입
  }
  
  const StatusTag = ({ label, type }: StatusTagProps) => {
    // type에 따라 CSS 클래스 이름을 다르게 지정합니다.
    const className = `status-tag ${type}`;
    return <span className={className}>{label}</span>;
  };
  
  export default StatusTag;