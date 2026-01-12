import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import AppLayout from '@/components/layout/AppLayout';
import SlotGrid, { TimeSlot } from '@/components/events/SlotGrid';
import { useUser } from '@/contexts/UserContext';

// Helper to get username from Renaissance/Farcaster context
const getSDKUsername = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  
  if (win.__renaissanceAuthContext?.user?.username) {
    return win.__renaissanceAuthContext.user.username;
  }
  
  if (win.farcaster?.context) {
    try {
      const ctx = await Promise.resolve(win.farcaster.context);
      if (ctx?.user?.username) {
        return ctx.user.username;
      }
    } catch {
      // ignore
    }
  }
  
  return null;
};

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

const FixedBookingBar = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  bottom: calc(64px + env(safe-area-inset-bottom, 0px));
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(10, 10, 10, 0.98) 0%, rgba(10, 10, 10, 0.95) 100%);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(57, 255, 20, 0.3);
  padding: 1rem;
  z-index: 101;
  transform: translateY(${({ $isVisible }) => ($isVisible ? '0' : 'calc(100% + 64px)')});
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  transition: transform 0.3s ease, opacity 0.3s ease;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
`;

const BookingBarContent = styled.div`
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const BookingBarTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SummaryText = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.contrast};
  margin: 0;
  
  span {
    color: ${({ theme }) => theme.colors.accent};
    font-weight: 600;
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: rgba(224, 224, 224, 0.6);
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }
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

const PageSpacer = styled.div<{ $isVisible: boolean }>`
  height: ${({ $isVisible }) => ($isVisible ? '140px' : '0')};
  transition: height 0.3s ease;
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
  const [sdkUsername, setSdkUsername] = useState<string | null>(null);
  const [selectedSlotCount, setSelectedSlotCount] = useState<number>(1); // Single slot selection

  // Get username from SDK on mount
  useEffect(() => {
    getSDKUsername().then(setSdkUsername);
  }, []);

  // Default to 1 hour worth of slots when booking (if multi-slot is enabled)
  useEffect(() => {
    if (event && event.allowConsecutiveSlots && event.maxConsecutiveSlots > 1) {
      const slotsFor1Hour = Math.floor(60 / event.slotDurationMinutes);
      const defaultCount = Math.min(slotsFor1Hour, event.maxConsecutiveSlots);
      if (defaultCount > 1) {
        setSelectedSlotCount(defaultCount);
      }
    }
  }, [event]);

  // Check if multi-slot mode is enabled
  const isMultiSlotEnabled = event && (
    event.allowConsecutiveSlots === true || 
    (event.allowConsecutiveSlots as unknown) === 1
  ) && event.maxConsecutiveSlots > 1;

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
          booking?: { djId: string; djName?: string; b2bPartner?: string };
        }) => ({
          ...slot,
          startTime: new Date(slot.startTime),
          endTime: new Date(slot.endTime),
          // Only mark as 'yours' if both user and booking exist and IDs match
          status: slot.booking && user && slot.booking.djId === user.id ? 'yours' : slot.status,
          djName: slot.booking?.djName,
          b2bPartner: slot.booking?.b2bPartner,
        }));
        
        setSlots(transformedSlots);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id, user]);

  // Handle slot click
  const handleSlotClickWithCount = (slotId: string) => {
    // If already selected, deselect
    if (selectedSlotIds.includes(slotId)) {
      setSelectedSlotIds([]);
      return;
    }

    // Find the clicked slot
    const clickedSlot = slots.find(s => s.id === slotId);
    if (!clickedSlot || clickedSlot.status !== 'available') {
      return; // Can't select booked slots
    }

    // In single slot mode, just select one
    if (selectedSlotCount === 1) {
      setSelectedSlotIds([slotId]);
      return;
    }

    // In multi-slot mode, find consecutive available slots starting from clicked
    const clickedIndex = slots.findIndex(s => s.id === slotId);
    const slotsToSelect: string[] = [slotId];

    // Look for consecutive available slots after the clicked one
    for (let i = clickedIndex + 1; i < slots.length && slotsToSelect.length < selectedSlotCount; i++) {
      const nextSlot = slots[i];
      // Check if this slot is consecutive (starts when previous ends)
      const prevSlot = slots[i - 1];
      const prevEndTime = new Date(prevSlot.endTime).getTime();
      const nextStartTime = new Date(nextSlot.startTime).getTime();
      
      if (nextSlot.status === 'available' && nextStartTime === prevEndTime) {
        slotsToSelect.push(nextSlot.id);
      } else {
        break; // Gap found or slot not available
      }
    }

    // Only select if we have enough consecutive slots
    if (slotsToSelect.length === selectedSlotCount) {
      setSelectedSlotIds(slotsToSelect);
    }
    // Otherwise don't select anything (not enough consecutive slots available)
  };

  const handleBook = async () => {
    if (selectedSlotIds.length === 0) return;

    // If user is not logged in, redirect to login with return URL
    if (!user) {
      const returnUrl = encodeURIComponent(`/events/${id}`);
      router.push(`/login?redirect=${returnUrl}`);
      return;
    }

    setBooking(true);
    setError(null);

    try {
      const username = sdkUsername || user?.username;
      if (!username) {
        throw new Error('Please sign in to book slots');
      }

      const response = await fetch(`/api/events/${id}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotIds: selectedSlotIds, username }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to book slots');
      }

      const data = await response.json();
      
      // Redirect to booking confirmation page
      if (data.bookings && data.bookings.length > 0) {
        router.push(`/bookings/${data.bookings[0].id}?confirmed=true`);
      } else {
        router.push('/bookings');
      }
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
          <SectionTitle>Book Your Set</SectionTitle>
          
          {/* Selection shown inline in slot grid */}

          {/* Always show all slots - booked and available */}
          <SlotGridContainer>
            <SlotGrid
              slots={slots}
              selectedSlotIds={selectedSlotIds}
              onSlotClick={handleSlotClickWithCount}
              allowConsecutive={isMultiSlotEnabled ? true : false}
              maxConsecutive={isMultiSlotEnabled ? event.maxConsecutiveSlots : 1}
              currentUserId={user?.id}
              selectedSlotCount={selectedSlotCount}
            />
          </SlotGridContainer>

          {error && <ErrorMessage style={{ marginTop: '1rem' }}>{error}</ErrorMessage>}
          
          <PageSpacer $isVisible={selectedSlotIds.length > 0} />
        </Section>
      </PageContainer>
      
      <FixedBookingBar $isVisible={selectedSlotIds.length > 0}>
        <BookingBarContent>
          <BookingBarTop>
            <SummaryText>
              <span>{selectedSlotIds.length} slot{selectedSlotIds.length > 1 ? 's' : ''}</span> · {getSelectedSlotTimes()}
            </SummaryText>
            <ClearButton onClick={() => setSelectedSlotIds([])}>
              Clear
            </ClearButton>
          </BookingBarTop>
          <BookButton onClick={handleBook} disabled={booking}>
            {booking ? 'Booking...' : user ? 'Book Now' : 'Sign Up to Book'}
          </BookButton>
        </BookingBarContent>
      </FixedBookingBar>
    </AppLayout>
  );
}
