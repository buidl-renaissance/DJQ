import styled from 'styled-components';
import Link from 'next/link';

const Card = styled.a`
  display: block;
  background-color: rgba(26, 26, 26, 0.7);
  border: 1px solid rgba(57, 255, 20, 0.2);
  border-radius: 12px;
  padding: 1rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover, &:active {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(57, 255, 20, 0.2);
    border-color: rgba(57, 255, 20, 0.4);
  }
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(57, 255, 20, 0.05), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
`;

const Title = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.contrast};
  margin: 0;
  flex: 1;
  margin-right: 0.5rem;
`;

const StatusBadge = styled.span<{ $status: string }>`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background-color: ${({ $status }) => {
    switch ($status) {
      case 'published':
        return 'rgba(57, 255, 20, 0.2)';
      case 'active':
        return 'rgba(255, 45, 149, 0.2)';
      case 'draft':
        return 'rgba(224, 224, 224, 0.1)';
      default:
        return 'rgba(224, 224, 224, 0.1)';
    }
  }};
  color: ${({ $status, theme }) => {
    switch ($status) {
      case 'published':
        return theme.colors.accent;
      case 'active':
        return theme.colors.secondary;
      default:
        return 'rgba(224, 224, 224, 0.6)';
    }
  }};
  border: 1px solid ${({ $status }) => {
    switch ($status) {
      case 'published':
        return 'rgba(57, 255, 20, 0.4)';
      case 'active':
        return 'rgba(255, 45, 149, 0.4)';
      default:
        return 'rgba(224, 224, 224, 0.2)';
    }
  }};
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
`;

const MetaItem = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.75rem;
  color: rgba(224, 224, 224, 0.6);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
`;

const FeatureBadge = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  background-color: rgba(57, 255, 20, 0.1);
  color: ${({ theme }) => theme.colors.accent};
  border: 1px solid rgba(57, 255, 20, 0.2);
`;

const AvailableSlots = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(224, 224, 224, 0.1);
`;

const SlotCount = styled.span<{ $hasAvailable: boolean }>`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ $hasAvailable, theme }) => 
    $hasAvailable ? theme.colors.accent : 'rgba(224, 224, 224, 0.4)'};
  text-shadow: ${({ $hasAvailable, theme }) => 
    $hasAvailable ? `0 0 10px ${theme.colors.accent}` : 'none'};
`;

const SlotLabel = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.7rem;
  color: rgba(224, 224, 224, 0.5);
  text-transform: uppercase;
`;

// Icons
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

export interface EventCardProps {
  id: string;
  title: string;
  eventDate: Date;
  startTime: Date;
  endTime: Date;
  slotDurationMinutes: number;
  allowB2B: boolean;
  allowConsecutiveSlots: boolean;
  status: string;
  availableSlots: number;
  totalSlots: number;
}

export default function EventCard({
  id,
  title,
  eventDate,
  startTime,
  endTime,
  slotDurationMinutes,
  allowB2B,
  allowConsecutiveSlots,
  status,
  availableSlots,
  totalSlots,
}: EventCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };
  
  return (
    <Link href={`/events/${id}`} passHref legacyBehavior>
      <Card>
        <CardHeader>
          <Title>{title}</Title>
          <StatusBadge $status={status}>{status}</StatusBadge>
        </CardHeader>
        
        <MetaRow>
          <MetaItem>
            <CalendarIcon />
            {formatDate(eventDate)}
          </MetaItem>
          <MetaItem>
            <ClockIcon />
            {formatTime(startTime)} - {formatTime(endTime)}
          </MetaItem>
        </MetaRow>
        
        <MetaRow>
          <MetaItem>{slotDurationMinutes} min sets</MetaItem>
        </MetaRow>
        
        <BadgeRow>
          {allowB2B && <FeatureBadge>B2B</FeatureBadge>}
          {allowConsecutiveSlots && <FeatureBadge>Multi-slot</FeatureBadge>}
        </BadgeRow>
        
        <AvailableSlots>
          <SlotCount $hasAvailable={availableSlots > 0}>{availableSlots}</SlotCount>
          <SlotLabel>of {totalSlots} slots open</SlotLabel>
        </AvailableSlots>
      </Card>
    </Link>
  );
}
