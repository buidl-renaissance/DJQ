import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import AppLayout from '@/components/layout/AppLayout';
import SlotGrid, { TimeSlot } from '@/components/events/SlotGrid';
import { useUser } from '@/contexts/UserContext';

const PageContainer = styled.div`
  padding: 1rem;
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

const EventHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const EventTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.contrast};
  margin: 0 0 0.75rem;
`;

const EventMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const MetaItem = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.8rem;
  color: rgba(224, 224, 224, 0.7);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const BadgeContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const Badge = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  background-color: rgba(57, 255, 20, 0.1);
  color: ${({ theme }) => theme.colors.accent};
  border: 1px solid rgba(57, 255, 20, 0.3);
`;

const Section = styled.section`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.contrast};
  margin: 0 0 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const SlotGridContainer = styled.div`
  background-color: rgba(26, 26, 26, 0.5);
  border: 1px solid rgba(57, 255, 20, 0.1);
  border-radius: 12px;
  padding: 1rem;
`;

const SelectionSummary = styled.div`
  background-color: rgba(57, 255, 20, 0.1);
  border: 1px solid rgba(57, 255, 20, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
`;

const SummaryText = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.contrast};
  margin: 0 0 0.75rem;
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
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(57, 255, 20, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    background: rgba(224, 224, 224, 0.2);
    color: rgba(224, 224, 224, 0.4);
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.secondary};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.75rem;
  cursor: pointer;
  text-decoration: underline;
  margin-top: 0.5rem;
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

interface EventData {
  id: string;
  title: string;
  description: string | null;
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

export default function EventDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();

  const [event, setEvent] = useState<EventData | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
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
        
        // Transform slots with user's booking info
        const transformedSlots: TimeSlot[] = data.slots.map((slot: {
          id: string;
          startTime: string;
          endTime: string;
          slotIndex: number;
          status: string;
          booking?: { djId: string; djName?: string };
        }) => ({
          ...slot,
          startTime: new Date(slot.startTime),
          endTime: new Date(slot.endTime),
          status: slot.booking?.djId === user?.id ? 'yours' : slot.status,
          djName: slot.booking?.djName,
        }));
        
        setSlots(transformedSlots);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id, user?.id]);

  const handleSlotClick = (slotId: string) => {
    setSelectedSlotIds((prev) => {
      if (prev.includes(slotId)) {
        // Deselect
        return prev.filter((id) => id !== slotId);
      } else {
        // Select
        if (!event?.allowConsecutiveSlots) {
          // Replace selection
          return [slotId];
        }
        // Add to selection
        return [...prev, slotId];
      }
    });
  };

  const handleBook = async () => {
    if (!user || selectedSlotIds.length === 0) return;

    setBooking(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${id}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotIds: selectedSlotIds }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to book slots');
      }

      // Refresh the page data
      router.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book slots');
    } finally {
      setBooking(false);
    }
  };

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

  const getSelectedSlotTimes = () => {
    const selected = slots
      .filter((s) => selectedSlotIds.includes(s.id))
      .sort((a, b) => a.slotIndex - b.slotIndex);

    if (selected.length === 0) return '';
    if (selected.length === 1) {
      return `${formatTime(selected[0].startTime.toISOString())} - ${formatTime(selected[0].endTime.toISOString())}`;
    }

    const first = selected[0];
    const last = selected[selected.length - 1];
    return `${formatTime(first.startTime.toISOString())} - ${formatTime(last.endTime.toISOString())}`;
  };

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

        <EventHeader>
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
          </EventMeta>

          <BadgeContainer>
            <Badge>{event.slotDurationMinutes} min sets</Badge>
            {event.allowB2B && <Badge>B2B Allowed</Badge>}
            {event.allowConsecutiveSlots && (
              <Badge>Up to {event.maxConsecutiveSlots} slots</Badge>
            )}
          </BadgeContainer>
        </EventHeader>

        {event.description && (
          <Section>
            <SectionTitle>About</SectionTitle>
            <p style={{ color: 'rgba(224, 224, 224, 0.7)', fontSize: '0.85rem', margin: 0 }}>
              {event.description}
            </p>
          </Section>
        )}

        <Section>
          <SectionTitle>Available Slots</SectionTitle>
          <SlotGridContainer>
            <SlotGrid
              slots={slots}
              selectedSlotIds={selectedSlotIds}
              onSlotClick={handleSlotClick}
              allowConsecutive={event.allowConsecutiveSlots}
              maxConsecutive={event.maxConsecutiveSlots}
              currentUserId={user?.id}
            />
          </SlotGridContainer>

          {selectedSlotIds.length > 0 && (
            <SelectionSummary>
              <SummaryText>
                {selectedSlotIds.length} slot{selectedSlotIds.length > 1 ? 's' : ''} selected: {getSelectedSlotTimes()}
              </SummaryText>
              <BookButton onClick={handleBook} disabled={booking || !user}>
                {booking ? 'Booking...' : user ? 'Book Now' : 'Sign in to Book'}
              </BookButton>
              <ClearButton onClick={() => setSelectedSlotIds([])}>
                Clear Selection
              </ClearButton>
            </SelectionSummary>
          )}

          {error && <ErrorMessage style={{ marginTop: '1rem' }}>{error}</ErrorMessage>}
        </Section>
      </PageContainer>
    </AppLayout>
  );
}
