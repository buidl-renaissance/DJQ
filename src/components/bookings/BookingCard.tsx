import styled from 'styled-components';
import Link from 'next/link';

const Card = styled.a`
  display: block;
  background-color: rgba(26, 26, 26, 0.7);
  border: 1px solid rgba(255, 45, 149, 0.2);
  border-radius: 12px;
  padding: 1rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover, &:active {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(255, 45, 149, 0.2);
    border-color: rgba(255, 45, 149, 0.4);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
`;

const EventTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.contrast};
  margin: 0;
  flex: 1;
`;

const StatusBadge = styled.span<{ $status: string }>`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  background-color: ${({ $status, theme }) => {
    switch ($status) {
      case 'confirmed':
        return 'rgba(57, 255, 20, 0.2)';
      case 'cancelled':
        return 'rgba(224, 224, 224, 0.1)';
      default:
        return 'rgba(255, 45, 149, 0.2)';
    }
  }};
  color: ${({ $status, theme }) => {
    switch ($status) {
      case 'confirmed':
        return theme.colors.accent;
      case 'cancelled':
        return 'rgba(224, 224, 224, 0.5)';
      default:
        return theme.colors.secondary;
    }
  }};
  border: 1px solid ${({ $status, theme }) => {
    switch ($status) {
      case 'confirmed':
        return 'rgba(57, 255, 20, 0.4)';
      case 'cancelled':
        return 'rgba(224, 224, 224, 0.2)';
      default:
        return 'rgba(255, 45, 149, 0.4)';
    }
  }};
`;

const TimeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const TimeLabel = styled.span`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.secondary};
  text-shadow: 0 0 10px rgba(255, 45, 149, 0.3);
`;

const DateLabel = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.75rem;
  color: rgba(224, 224, 224, 0.6);
`;

const B2BSection = styled.div`
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(224, 224, 224, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const B2BLabel = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.7rem;
  color: rgba(224, 224, 224, 0.5);
  text-transform: uppercase;
`;

const B2BPartner = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.accent};
`;

const PendingBadge = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.6rem;
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
  background-color: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.3);
`;

const MusicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

export interface BookingCardProps {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  slotStartTime: Date;
  slotEndTime: Date;
  status: 'confirmed' | 'cancelled';
  b2bPartner?: string | null;
  hasPendingB2B?: boolean;
}

export default function BookingCard({
  id,
  eventTitle,
  eventDate,
  slotStartTime,
  slotEndTime,
  status,
  b2bPartner,
  hasPendingB2B,
}: BookingCardProps) {
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
    <Link href={`/bookings/${id}`} passHref legacyBehavior>
      <Card>
        <CardHeader>
          <EventTitle>{eventTitle}</EventTitle>
          <StatusBadge $status={status}>{status}</StatusBadge>
        </CardHeader>

        <DateLabel>{formatDate(eventDate)}</DateLabel>

        <TimeInfo>
          <MusicIcon />
          <TimeLabel>
            {formatTime(slotStartTime)} - {formatTime(slotEndTime)}
          </TimeLabel>
        </TimeInfo>

        {(b2bPartner || hasPendingB2B) && (
          <B2BSection>
            <B2BLabel>B2B:</B2BLabel>
            {b2bPartner ? (
              <B2BPartner>{b2bPartner}</B2BPartner>
            ) : hasPendingB2B ? (
              <PendingBadge>Pending Request</PendingBadge>
            ) : null}
          </B2BSection>
        )}
      </Card>
    </Link>
  );
}
