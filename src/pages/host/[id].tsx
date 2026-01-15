import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import AppLayout from '@/components/layout/AppLayout';
import EventForm, { EventFormData } from '@/components/host/EventForm';
import { useUser } from '@/contexts/UserContext';
import { share, getBaseUrl } from '@/lib/share';

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

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-block;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  margin-bottom: 0.75rem;
  background-color: ${({ $status }) => {
    switch ($status) {
      case 'published':
        return 'rgba(57, 255, 20, 0.2)';
      case 'active':
        return 'rgba(255, 45, 149, 0.2)';
      case 'draft':
        return 'rgba(255, 193, 7, 0.2)';
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
      case 'draft':
        return '#ffc107';
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
      case 'draft':
        return 'rgba(255, 193, 7, 0.4)';
      default:
        return 'rgba(224, 224, 224, 0.2)';
    }
  }};
`;

const EventTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.contrast};
  margin: 0 0 0.5rem;
`;

const EventMeta = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.85rem;
  color: rgba(224, 224, 224, 0.6);
`;

const Section = styled.section`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.contrast};
  margin: 0 0 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
`;

const StatCard = styled.div`
  background-color: rgba(26, 26, 26, 0.7);
  border: 1px solid rgba(57, 255, 20, 0.15);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
`;

const StatValue = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accent};
  text-shadow: 0 0 10px rgba(57, 255, 20, 0.3);
`;

const StatLabel = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.65rem;
  color: rgba(224, 224, 224, 0.5);
  text-transform: uppercase;
`;

const SlotsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SlotItem = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: rgba(26, 26, 26, 0.5);
  border: 1px solid ${({ $status }) => 
    $status === 'booked' ? 'rgba(255, 45, 149, 0.2)' : 'rgba(57, 255, 20, 0.1)'};
  border-radius: 8px;
`;

const SlotTime = styled.span`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.contrast};
`;

const SlotInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DJName = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.secondary};
`;

const B2BBadge = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.6rem;
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
  background-color: rgba(57, 255, 20, 0.1);
  color: ${({ theme }) => theme.colors.accent};
  border: 1px solid rgba(57, 255, 20, 0.3);
`;

const OpenSlot = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.accent};
`;

const CancelSlotButton = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 45, 149, 0.3);
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.65rem;
  color: ${({ theme }) => theme.colors.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 0.75rem;
  
  &:hover:not(:disabled) {
    background: rgba(255, 45, 149, 0.1);
    border-color: ${({ theme }) => theme.colors.secondary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ActionButton = styled.button<{ $variant: 'primary' | 'secondary' | 'danger' }>`
  width: 100%;
  padding: 0.875rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 0.75rem;
  
  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, ${theme.colors.accent}, #2dd84a);
          color: ${theme.colors.background};
          border: none;
          
          &:hover:not(:disabled) {
            box-shadow: 0 4px 15px rgba(57, 255, 20, 0.3);
          }
        `;
      case 'secondary':
        return `
          background-color: transparent;
          color: rgba(224, 224, 224, 0.7);
          border: 1px solid rgba(224, 224, 224, 0.2);
          
          &:hover:not(:disabled) {
            background-color: rgba(224, 224, 224, 0.05);
          }
        `;
      case 'danger':
        return `
          background-color: transparent;
          color: ${theme.colors.secondary};
          border: 1px solid rgba(255, 45, 149, 0.3);
          
          &:hover:not(:disabled) {
            background-color: rgba(255, 45, 149, 0.1);
          }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

const ShareButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.accent};
  border: 2px solid ${({ theme }) => theme.colors.accent};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 0.75rem;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    background-color: rgba(57, 255, 20, 0.1);
    box-shadow: 0 0 15px rgba(57, 255, 20, 0.3);
  }
`;

const ShareFeedback = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.accent};
  margin-left: 0.5rem;
`;

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12,19 5,12 12,5" />
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

interface SlotData {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  booking?: {
    id: string;
    djId: string;
    djName: string;
    djUsername?: string;
    b2bPartner?: string;
  };
}

interface EventData {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  eventDate: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  allowConsecutiveSlots: boolean;
  maxConsecutiveSlots: number;
  allowB2B: boolean;
  status: string;
}

export default function ManageEventPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();

  const [event, setEvent] = useState<EventData | null>(null);
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancellingSlotId, setCancellingSlotId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sdkUsername, setSdkUsername] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Get username from SDK on mount
  useEffect(() => {
    getSDKUsername().then(setSdkUsername);
  }, []);

  useEffect(() => {
    if (!id) return;

    async function fetchEvent() {
      try {
        const username = sdkUsername || user?.username;
        const url = username 
          ? `/api/host/events/${id}?username=${encodeURIComponent(username)}`
          : `/api/host/events/${id}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch event');
        }
        const data = await response.json();
        setEvent(data.event);
        setSlots(data.slots || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id, sdkUsername, user?.username]);

  const handleShare = async () => {
    if (!event) return;
    
    const eventUrl = `${getBaseUrl()}/events/${event.id}`;
    const result = await share({
      title: `Open Decks: ${event.title}`,
      text: `Join the open decks at ${event.title}! Sign up for a slot and spin some tunes 🎧`,
      url: eventUrl,
    });

    if (result === 'copied') {
      setShareFeedback('Link copied!');
      setTimeout(() => setShareFeedback(null), 2000);
    } else if (result === 'shared') {
      setShareFeedback('Shared!');
      setTimeout(() => setShareFeedback(null), 2000);
    }
  };

  const handlePublish = async () => {
    setActionLoading(true);
    setError(null);

    try {
      const username = sdkUsername || user?.username;
      const response = await fetch(`/api/host/events/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to publish event');
      }

      router.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish event');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This cannot be undone.')) return;

    setActionLoading(true);
    try {
      const username = sdkUsername || user?.username;
      const url = username 
        ? `/api/host/events/${id}?username=${encodeURIComponent(username)}`
        : `/api/host/events/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete event');
      }

      router.push('/host');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async (slot: SlotData, singleSlotOnly: boolean = false) => {
    if (!slot.booking) return;
    
    const djName = slot.booking.djName;
    const slotTime = formatTime(slot.startTime);
    
    // Check if DJ has multiple consecutive slots
    const djSlots = slots.filter(s => 
      s.booking?.djId === slot.booking?.djId && 
      s.booking?.djName === djName &&
      s.status === 'booked'
    );
    const hasMultipleSlots = djSlots.length > 1;
    
    let confirmSingleSlot = singleSlotOnly;
    
    if (hasMultipleSlots && !singleSlotOnly) {
      // Ask if they want to cancel just this slot or all slots
      const choice = prompt(
        `${djName} has ${djSlots.length} consecutive slots booked.\n\n` +
        `Type "all" to cancel all their slots, or "single" to cancel only the ${slotTime} slot:`
      );
      
      if (!choice) return; // User cancelled
      
      if (choice.toLowerCase() === 'single') {
        confirmSingleSlot = true;
      } else if (choice.toLowerCase() !== 'all') {
        alert('Please type "all" or "single"');
        return;
      }
    } else {
      if (!confirm(`Cancel ${djName}'s set at ${slotTime}?`)) return;
    }

    setCancellingSlotId(slot.id);
    setError(null);

    try {
      const username = sdkUsername || user?.username;
      const response = await fetch(`/api/bookings/${slot.booking.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, singleSlot: confirmSingleSlot }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel booking');
      }

      // Refresh the event data
      const refreshUrl = username 
        ? `/api/host/events/${id}?username=${encodeURIComponent(username)}`
        : `/api/host/events/${id}`;
      const refreshResponse = await fetch(refreshUrl);
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setSlots(data.slots || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    } finally {
      setCancellingSlotId(null);
    }
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    if (!event) return null;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('eventId', event.id);

    try {
      const response = await fetch('/api/events/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      return result.imageUrl;
    } catch (err) {
      console.error('Failed to upload image:', err);
      throw err;
    }
  };

  const handleEditSubmit = async (data: EventFormData, publish: boolean) => {
    if (!event) return;

    setEditLoading(true);
    setError(null);

    try {
      const username = sdkUsername || user?.username;

      // Build update payload
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatePayload: Record<string, any> = {
        username,
        title: data.title,
        description: data.description || null,
        imageUrl: data.imageUrl,
        allowConsecutiveSlots: data.allowConsecutiveSlots,
        maxConsecutiveSlots: data.maxConsecutiveSlots,
        allowB2B: data.allowB2B,
      };

      // Include date/time changes for all events
      const eventDate = new Date(`${data.eventDate}T00:00:00`);
      const startTime = new Date(`${data.eventDate}T${data.startTime}`);
      const endTime = new Date(`${data.eventDate}T${data.endTime}`);

      updatePayload.eventDate = eventDate.toISOString();
      updatePayload.startTime = startTime.toISOString();
      updatePayload.endTime = endTime.toISOString();

      // Only include slot duration changes for draft events
      if (event.status === 'draft') {
        updatePayload.slotDurationMinutes = data.slotDurationMinutes;
      }

      const response = await fetch(`/api/host/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update event');
      }

      // If publish was requested and event is draft, publish it
      if (publish && event.status === 'draft') {
        const publishResponse = await fetch(`/api/host/events/${id}/publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username }),
        });

        if (!publishResponse.ok) {
          const result = await publishResponse.json();
          throw new Error(result.error || 'Failed to publish event');
        }
      }

      // Refresh event data and exit edit mode
      const refreshUrl = username 
        ? `/api/host/events/${id}?username=${encodeURIComponent(username)}`
        : `/api/host/events/${id}`;
      const refreshResponse = await fetch(refreshUrl);
      if (refreshResponse.ok) {
        const result = await refreshResponse.json();
        setEvent(result.event);
        setSlots(result.slots || []);
      }

      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
    } finally {
      setEditLoading(false);
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

  if (loading) {
    return (
      <AppLayout title="Manage Event | DJ Tap-In Queue">
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
          <BackButton onClick={() => router.push('/host')}>
            <ArrowLeftIcon />
            Back to Events
          </BackButton>
          <ErrorMessage>Event not found</ErrorMessage>
        </PageContainer>
      </AppLayout>
    );
  }

  const bookedSlots = slots.filter((s) => s.status === 'booked').length;
  const availableSlots = slots.filter((s) => s.status === 'available').length;

  // Convert event to form data format
  const getInitialFormData = (): Partial<EventFormData> => {
    const eventDateObj = new Date(event.eventDate);
    const startTimeObj = new Date(event.startTime);
    const endTimeObj = new Date(event.endTime);

    return {
      title: event.title,
      description: event.description || '',
      imageUrl: event.imageUrl,
      eventDate: eventDateObj.toISOString().split('T')[0],
      startTime: startTimeObj.toTimeString().slice(0, 5),
      endTime: endTimeObj.toTimeString().slice(0, 5),
      slotDurationMinutes: event.slotDurationMinutes as 20 | 30 | 60,
      allowConsecutiveSlots: event.allowConsecutiveSlots,
      maxConsecutiveSlots: event.maxConsecutiveSlots,
      allowB2B: event.allowB2B,
    };
  };

  // If in edit mode, show the form
  if (isEditing) {
    return (
      <AppLayout title={`Edit: ${event.title} | DJ Tap-In Queue`}>
        <PageContainer>
          <BackButton onClick={() => setIsEditing(false)}>
            <ArrowLeftIcon />
            Cancel Editing
          </BackButton>

          <EventHeader>
            <StatusBadge $status={event.status}>{event.status}</StatusBadge>
            <EventTitle>Edit Event</EventTitle>
            {event.status !== 'draft' && (
              <EventMeta style={{ color: 'rgba(255, 193, 7, 0.8)' }}>
                Note: Slot duration cannot be changed for published events
              </EventMeta>
            )}
          </EventHeader>

          <EventForm
            initialData={getInitialFormData()}
            onSubmit={handleEditSubmit}
            onImageUpload={handleImageUpload}
            loading={editLoading}
            isEdit={true}
          />

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </PageContainer>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={`${event.title} | DJ Tap-In Queue`}>
      <PageContainer>
        <BackButton onClick={() => router.push('/host')}>
          <ArrowLeftIcon />
          Back to Events
        </BackButton>

        <EventHeader>
          <StatusBadge $status={event.status}>{event.status}</StatusBadge>
          <EventTitle>{event.title}</EventTitle>
          <EventMeta>{formatDate(event.eventDate)}</EventMeta>
          <EventMeta>{formatTime(event.startTime)} - {formatTime(event.endTime)}</EventMeta>
        </EventHeader>

        <Section>
          <SectionTitle>Stats</SectionTitle>
          <StatsGrid>
            <StatCard>
              <StatValue>{bookedSlots}</StatValue>
              <StatLabel>Booked</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{availableSlots}</StatValue>
              <StatLabel>Available</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{slots.length}</StatValue>
              <StatLabel>Total</StatLabel>
            </StatCard>
          </StatsGrid>
        </Section>

        {slots.length > 0 && (
          <Section>
            <SectionTitle>Time Slots</SectionTitle>
            <SlotsList>
              {slots.map((slot) => (
                <SlotItem key={slot.id} $status={slot.status}>
                  <SlotTime>{formatTime(slot.startTime)}</SlotTime>
                  <SlotInfo>
                    {slot.booking ? (
                      <>
                        <DJName>{slot.booking.djName}</DJName>
                        {slot.booking.b2bPartner && (
                          <B2BBadge>+ {slot.booking.b2bPartner}</B2BBadge>
                        )}
                        <CancelSlotButton
                          onClick={() => handleCancelBooking(slot)}
                          disabled={cancellingSlotId === slot.id}
                        >
                          {cancellingSlotId === slot.id ? 'Cancelling...' : 'Cancel'}
                        </CancelSlotButton>
                      </>
                    ) : (
                      <OpenSlot>Open</OpenSlot>
                    )}
                  </SlotInfo>
                </SlotItem>
              ))}
            </SlotsList>
          </Section>
        )}

        <Section>
          <SectionTitle>Actions</SectionTitle>
          {(event.status === 'published' || event.status === 'active') && (
            <ShareButton onClick={handleShare}>
              <ShareIcon />
              Share Event
              {shareFeedback && <ShareFeedback>{shareFeedback}</ShareFeedback>}
            </ShareButton>
          )}
          <ActionButton
            $variant="secondary"
            onClick={() => setIsEditing(true)}
            disabled={actionLoading}
          >
            Edit Event
          </ActionButton>
          {event.status === 'draft' && (
            <ActionButton
              $variant="primary"
              onClick={handlePublish}
              disabled={actionLoading}
            >
              {actionLoading ? 'Publishing...' : 'Publish Event'}
            </ActionButton>
          )}
          <ActionButton
            $variant="danger"
            onClick={handleDelete}
            disabled={actionLoading}
          >
            Delete Event
          </ActionButton>
        </Section>

        {error && <ErrorMessage>{error}</ErrorMessage>}
      </PageContainer>
    </AppLayout>
  );
}
