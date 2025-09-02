// src/components/StatusTag.tsx
import './StatusTag.css';

// 더 구체적인 타입 정의
type StatusType = 'paid' | 'unpaid' | 'delivered' | 'undelivered' | 'rice-ok' | 'rice-no';

interface StatusTagProps {
  label: string;
  type: StatusType;
}

const StatusTag = ({ label, type }: StatusTagProps) => {
  const className = `status-tag ${type}`;
  return <span className={className}>{label}</span>;
};

export default StatusTag;