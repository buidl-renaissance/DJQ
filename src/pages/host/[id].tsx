import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import AppLayout from '@/components/layout/AppLayout';
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

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12,19 5,12 12,5" />
  </svg>
);

interface SlotData {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  booking?: {
    djName: string;
    b2bPartner?: string;
  };
}

interface EventData {
  id: string;
  title: string;
  description: string | null;
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
  const [error, setError] = useState<string | null>(null);
  const [sdkUsername, setSdkUsername] = useState<string | null>(null);

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

  const handlePublish = async () => {
    setActionLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/host/events/${id}/publish`, {
        method: 'POST',
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
      const response = await fetch(`/api/host/events/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      router.push('/host');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    } finally {
      setActionLoading(false);
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
          <EventMeta>
            {formatDate(event.eventDate)} · {formatTime(event.startTime)} - {formatTime(event.endTime)}
          </EventMeta>
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
