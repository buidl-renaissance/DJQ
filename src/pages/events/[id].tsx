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

// Selected slots inline summary
const SelectionSummary = styled.div`
  background: linear-gradient(135deg, rgba(57, 255, 20, 0.15) 0%, rgba(57, 255, 20, 0.05) 100%);
  border: 1px solid rgba(57, 255, 20, 0.4);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const SelectionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const SelectionTitle = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${({ theme }) => theme.colors.accent};
`;

const SelectionTime = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.contrast};
`;

const SelectionDuration = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.75rem;
  color: rgba(224, 224, 224, 0.7);
`;

const ClearSelectionButton = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 45, 149, 0.5);
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: rgba(255, 45, 149, 0.1);
    border-color: ${({ theme }) => theme.colors.secondary};
  }
`;

// Slot count selector for multi-slot booking
const SlotCountSelector = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: rgba(57, 255, 20, 0.05);
  border: 1px solid rgba(57, 255, 20, 0.2);
  border-radius: 8px;
`;

const SlotCountLabel = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(224, 224, 224, 0.7);
  margin-bottom: 0.75rem;
`;

const SlotCountButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const SlotCountButton = styled.button<{ $isActive: boolean }>`
  flex: 1;
  padding: 0.75rem 1rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.9rem;
  font-weight: 700;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ $isActive, theme }) => $isActive ? `
    background-color: ${theme.colors.accent};
    color: ${theme.colors.background};
    border: 1px solid ${theme.colors.accent};
    box-shadow: 0 0 15px rgba(57, 255, 20, 0.4);
  ` : `
    background-color: rgba(0, 0, 0, 0.2);
    color: rgba(224, 224, 224, 0.7);
    border: 1px solid rgba(224, 224, 224, 0.1);
    
    &:hover {
      border-color: rgba(57, 255, 20, 0.3);
      color: ${theme.colors.accent};
    }
  `}
`;

const SlotCountDuration = styled.span`
  font-size: 0.7rem;
  opacity: 0.7;
  display: block;
  margin-top: 0.25rem;
`;

// Window selection for multi-slot mode
const WindowGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
`;

const WindowCard = styled.button<{ $isSelected: boolean; $isAvailable: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-radius: 8px;
  cursor: ${({ $isAvailable }) => $isAvailable ? 'pointer' : 'not-allowed'};
  transition: all 0.2s ease;
  
  ${({ $isSelected, $isAvailable, theme }) => {
    if (!$isAvailable) {
      return `
        background-color: rgba(224, 224, 224, 0.05);
        border: 1px solid rgba(224, 224, 224, 0.1);
        color: rgba(224, 224, 224, 0.3);
      `;
    }
    if ($isSelected) {
      return `
        background-color: rgba(57, 255, 20, 0.2);
        border: 1px solid ${theme.colors.accent};
        color: ${theme.colors.accent};
        box-shadow: 0 0 15px rgba(57, 255, 20, 0.3);
      `;
    }
    return `
      background-color: rgba(57, 255, 20, 0.05);
      border: 1px solid rgba(57, 255, 20, 0.2);
      color: ${theme.colors.accent};
      
      &:hover {
        background-color: rgba(57, 255, 20, 0.1);
        border-color: rgba(57, 255, 20, 0.4);
      }
    `;
  }}
`;

const WindowTime = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1rem;
  font-weight: 700;
`;

const WindowStatus = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
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
  const [selectedSlotCount, setSelectedSlotCount] = useState<number>(1);

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

  // Calculate available windows based on selected slot count
  const getAvailableWindows = () => {
    if (!isMultiSlotEnabled || selectedSlotCount === 1) return [];
    
    const windows: { startSlot: TimeSlot; endSlot: TimeSlot; slotIds: string[] }[] = [];
    
    // Sort by slot index
    const sortedSlots = [...slots].sort((a, b) => a.slotIndex - b.slotIndex);
    
    // Find consecutive available windows
    for (let i = 0; i <= sortedSlots.length - selectedSlotCount; i++) {
      const windowSlots = sortedSlots.slice(i, i + selectedSlotCount);
      
      // Check if all slots in window are available and consecutive
      const allAvailable = windowSlots.every(s => s.status === 'available');
      const allConsecutive = windowSlots.every((s, idx) => 
        idx === 0 || s.slotIndex === windowSlots[idx - 1].slotIndex + 1
      );
      
      if (allAvailable && allConsecutive) {
        windows.push({
          startSlot: windowSlots[0],
          endSlot: windowSlots[windowSlots.length - 1],
          slotIds: windowSlots.map(s => s.id),
        });
      }
    }
    
    return windows;
  };

  const availableWindows = getAvailableWindows();

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
    // In multi-slot mode with count > 1, use window selection instead
    if (isMultiSlotEnabled && selectedSlotCount > 1) {
      return; // Window selection is handled by handleWindowSelect
    }
    
    setSelectedSlotIds((prev) => {
      if (prev.includes(slotId)) {
        // Deselect
        return prev.filter((id) => id !== slotId);
      } else {
        // Select single slot
        return [slotId];
      }
    });
  };

  const handleWindowSelect = (slotIds: string[]) => {
    setSelectedSlotIds((prev) => {
      // If same window is selected, deselect
      if (prev.length === slotIds.length && prev.every(id => slotIds.includes(id))) {
        return [];
      }
      // Select the window
      return slotIds;
    });
  };

  const handleSlotCountChange = (count: number) => {
    setSelectedSlotCount(count);
    setSelectedSlotIds([]); // Clear selection when changing slot count
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
          
          {/* Inline selection summary */}
          {selectedSlotIds.length > 0 && (
            <SelectionSummary>
              <SelectionInfo>
                <SelectionTitle>Your Selection</SelectionTitle>
                <SelectionTime>{getSelectedSlotTimes()}</SelectionTime>
                <SelectionDuration>
                  {selectedSlotIds.length} slot{selectedSlotIds.length > 1 ? 's' : ''} · {selectedSlotIds.length * event.slotDurationMinutes} min total
                </SelectionDuration>
              </SelectionInfo>
              <ClearSelectionButton onClick={() => setSelectedSlotIds([])}>
                Clear
              </ClearSelectionButton>
            </SelectionSummary>
          )}
          
          {/* Slot count selector for multi-slot mode */}
          {isMultiSlotEnabled && (
            <SlotCountSelector>
              <SlotCountLabel>Set Length</SlotCountLabel>
              <SlotCountButtons>
                {Array.from({ length: event.maxConsecutiveSlots }, (_, i) => i + 1).map(count => (
                  <SlotCountButton
                    key={count}
                    $isActive={selectedSlotCount === count}
                    onClick={() => handleSlotCountChange(count)}
                  >
                    {count} slot{count > 1 ? 's' : ''}
                    <SlotCountDuration>
                      {count * event.slotDurationMinutes} min
                    </SlotCountDuration>
                  </SlotCountButton>
                ))}
              </SlotCountButtons>
            </SlotCountSelector>
          )}

          {/* Show windows when multi-slot count > 1 is selected */}
          {isMultiSlotEnabled && selectedSlotCount > 1 ? (
            <WindowGrid>
              {availableWindows.length > 0 ? (
                availableWindows.map((window, idx) => {
                  const isSelected = selectedSlotIds.length === window.slotIds.length && 
                    selectedSlotIds.every(id => window.slotIds.includes(id));
                  return (
                    <WindowCard
                      key={idx}
                      $isSelected={isSelected}
                      $isAvailable={true}
                      onClick={() => handleWindowSelect(window.slotIds)}
                    >
                      <WindowTime>
                        {formatTime(window.startSlot.startTime.toISOString())} - {formatTime(window.endSlot.endTime.toISOString())}
                      </WindowTime>
                      <WindowStatus>
                        {isSelected ? 'Selected' : 'Available'}
                      </WindowStatus>
                    </WindowCard>
                  );
                })
              ) : (
                <ErrorMessage>No available {selectedSlotCount}-slot windows</ErrorMessage>
              )}
            </WindowGrid>
          ) : (
            <SlotGridContainer>
              <SlotGrid
                slots={slots}
                selectedSlotIds={selectedSlotIds}
                onSlotClick={handleSlotClick}
                allowConsecutive={false}
                maxConsecutive={1}
                currentUserId={user?.id}
              />
            </SlotGridContainer>
          )}

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
