import styled from 'styled-components';
import Link from 'next/link';

const CardBase = styled.div`
  display: block;
  background-color: rgba(26, 26, 26, 0.7);
  border: 1px solid rgba(255, 45, 149, 0.2);
  border-radius: 12px;
  padding: 1rem;
  text-decoration: none;
  color: inherit;
  position: relative;
  overflow: hidden;
`;

const CardLink = styled.a`
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

const EventTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.contrast};
  margin: 0 0 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailIcon = styled.span`
  width: 28px;
  height: 28px;
  background: ${({ theme }) => theme.colors.dark};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
`;

const DetailText = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.contrast};
`;

const TimeText = styled.span`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.secondary};
  text-shadow: 0 0 10px rgba(255, 45, 149, 0.3);
`;

export interface EventSlotCardProps {
  eventTitle: string;
  eventDate: string | Date;
  slotStartTime: string | Date;
  slotEndTime: string | Date;
  href?: string;
}

export default function EventSlotCard({
  eventTitle,
  eventDate,
  slotStartTime,
  slotEndTime,
  href,
}: EventSlotCardProps) {
  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (time: string | Date) => {
    // Handle time string like "22:00:00" or Date object
    if (typeof time === 'string' && time.includes(':') && !time.includes('T')) {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    }
    const d = typeof time === 'string' ? new Date(time) : time;
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const content = (
    <>
      <EventTitle>{eventTitle}</EventTitle>
      <DetailRow>
        <DetailIcon>📅</DetailIcon>
        <DetailText>{formatDate(eventDate)}</DetailText>
      </DetailRow>
      <DetailRow>
        <DetailIcon>🎧</DetailIcon>
        <TimeText>
          {formatTime(slotStartTime)} – {formatTime(slotEndTime)}
        </TimeText>
      </DetailRow>
    </>
  );

  if (href) {
    return (
      <Link href={href} passHref legacyBehavior>
        <CardLink>{content}</CardLink>
      </Link>
    );
  }

  return <CardBase>{content}</CardBase>;
}
