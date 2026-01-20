import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import AppLayout from '@/components/layout/AppLayout';

const PageContainer = styled.div`
  padding: 1rem;
  padding-bottom: 100px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.accent};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  &:hover {
    text-decoration: underline;
  }
`;

const EventImage = styled.div<{ $hasImage: boolean }>`
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1.5rem;
  background: ${({ $hasImage }) => $hasImage ? 'transparent' : 'linear-gradient(135deg, rgba(57, 255, 20, 0.1), rgba(255, 45, 149, 0.1))'};
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PlaceholderIcon = styled.div`
  color: rgba(224, 224, 224, 0.3);
  
  svg {
    width: 64px;
    height: 64px;
  }
`;

const EventTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.contrast};
  margin: 0 0 1rem;
`;

const EventMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const MetaItem = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.9rem;
  color: rgba(224, 224, 224, 0.8);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  svg {
    width: 20px;
    height: 20px;
    color: ${({ theme }) => theme.colors.accent};
    flex-shrink: 0;
  }
`;

const Section = styled.section`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.contrast};
  margin: 0 0 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Description = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.9rem;
  color: rgba(224, 224, 224, 0.7);
  line-height: 1.6;
  margin: 0;
`;

const BadgeContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
`;

const Badge = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  background-color: rgba(57, 255, 20, 0.1);
  color: ${({ theme }) => theme.colors.accent};
  border: 1px solid rgba(57, 255, 20, 0.3);
`;

const LineupContainer = styled.div`
  background-color: rgba(26, 26, 26, 0.5);
  border: 1px solid rgba(57, 255, 20, 0.1);
  border-radius: 12px;
  padding: 1rem;
`;

const LineupItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  
  &:last-child {
    border-bottom: none;
  }
`;

const DJInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const DJName = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.contrast};
  font-weight: 500;
`;

const B2BTag = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.secondary};
  background: rgba(255, 45, 149, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
`;

const SlotTime = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.8rem;
  color: rgba(224, 224, 224, 0.6);
`;

const EmptyLineup = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.85rem;
  color: rgba(224, 224, 224, 0.5);
  text-align: center;
  padding: 1rem;
  margin: 0;
`;

const FixedCTABar = styled.div`
  position: fixed;
  bottom: calc(64px + env(safe-area-inset-bottom, 0px));
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(10, 10, 10, 0.98) 0%, rgba(10, 10, 10, 0.95) 100%);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(57, 255, 20, 0.3);
  padding: 1rem;
  z-index: 101;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
`;

const CTAContent = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const BookButton = styled.button`
  width: 100%;
  padding: 1rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent}, #2dd84a);
  color: ${({ theme }) => theme.colors.background};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(57, 255, 20, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(57, 255, 20, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  min-height: 50vh;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(57, 255, 20, 0.1);
  border-top-color: ${({ theme }) => theme.colors.accent};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  background-color: rgba(255, 45, 149, 0.1);
  border: 1px solid rgba(255, 45, 149, 0.3);
  border-radius: 8px;
  padding: 1rem;
  color: ${({ theme }) => theme.colors.secondary};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.85rem;
  text-align: center;
`;

// Icons
const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12,19 5,12 12,5" />
  </svg>
);

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

const LocationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const MusicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

interface EventData {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  imageUrl: string | null;
  hostId: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  allowConsecutiveSlots: boolean;
  maxConsecutiveSlots: number;
  allowB2B: boolean;
  status: string;
}

interface SlotData {
  id: string;
  startTime: string;
  endTime: string;
  slotIndex: number;
  status: string;
  booking?: {
    djId: string;
    djName: string;
    b2bPartner?: string;
  };
}

export default function EventPage() {
  const router = useRouter();
  const { id } = router.query;

  const [event, setEvent] = useState<EventData | null>(null);
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchEvent() {
      try {
        const response = await fetch(`/api/events/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch event');
        }
        const data = await response.json();
        setEvent(data.event);
        setSlots(data.slots);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Get booked slots with DJ info for the lineup
  const lineup = slots
    .filter(slot => slot.booking)
    .sort((a, b) => a.slotIndex - b.slotIndex);

  // Check if there are available slots
  const hasAvailableSlots = slots.some(slot => slot.status === 'available');

  if (loading) {
    return (
      <AppLayout title="Loading... | DJ Tap-In Queue">
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </AppLayout>
    );
  }

  if (!event) {
    return (
      <AppLayout title="Event Not Found | DJ Tap-In Queue">
        <PageContainer>
          <BackButton onClick={() => router.push('/events')}>
            <ArrowLeftIcon />
            Back to Events
          </BackButton>
          <ErrorMessage>Event not found</ErrorMessage>
        </PageContainer>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={`${event.title} | DJ Tap-In Queue`}>
      <PageContainer>
        <BackButton onClick={() => router.push('/events')}>
          <ArrowLeftIcon />
          Back to Events
        </BackButton>

        <EventImage $hasImage={!!event.imageUrl}>
          {event.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.imageUrl} alt={event.title} />
          ) : (
            <PlaceholderIcon>
              <MusicIcon />
            </PlaceholderIcon>
          )}
        </EventImage>

        <EventTitle>{event.title}</EventTitle>

        <EventMeta>
          <MetaItem>
            <CalendarIcon />
            {formatDate(event.eventDate)}
          </MetaItem>
          <MetaItem>
            <ClockIcon />
            {formatTime(event.startTime)} - {formatTime(event.endTime)}
          </MetaItem>
          {event.location && (
            <MetaItem>
              <LocationIcon />
              {event.location}
            </MetaItem>
          )}
        </EventMeta>

        <BadgeContainer>
          <Badge>{event.slotDurationMinutes} min sets</Badge>
          {event.allowB2B && <Badge>B2B Allowed</Badge>}
          {event.allowConsecutiveSlots && (
            <Badge>Up to {event.maxConsecutiveSlots} consecutive slots</Badge>
          )}
          {hasAvailableSlots ? (
            <Badge>Slots Available</Badge>
          ) : (
            <Badge style={{ background: 'rgba(255, 45, 149, 0.1)', color: '#ff2d95', borderColor: 'rgba(255, 45, 149, 0.3)' }}>
              Fully Booked
            </Badge>
          )}
        </BadgeContainer>

        {event.description && (
          <Section>
            <SectionTitle>About</SectionTitle>
            <Description>{event.description}</Description>
          </Section>
        )}

        <Section>
          <SectionTitle>Lineup</SectionTitle>
          <LineupContainer>
            {lineup.length > 0 ? (
              lineup.map((slot) => (
                <LineupItem key={slot.id}>
                  <DJInfo>
                    <DJName>{slot.booking?.djName}</DJName>
                    {slot.booking?.b2bPartner && (
                      <B2BTag>B2B w/ {slot.booking.b2bPartner}</B2BTag>
                    )}
                  </DJInfo>
                  <SlotTime>
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </SlotTime>
                </LineupItem>
              ))
            ) : (
              <EmptyLineup>No DJs booked yet. Be the first!</EmptyLineup>
            )}
          </LineupContainer>
        </Section>

        {error && <ErrorMessage>{error}</ErrorMessage>}
      </PageContainer>

      {hasAvailableSlots && (
        <FixedCTABar>
          <CTAContent>
            <BookButton onClick={() => router.push(`/events/${id}/book`)}>
              Book a Set
            </BookButton>
          </CTAContent>
        </FixedCTABar>
      )}
    </AppLayout>
  );
}
