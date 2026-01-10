import { useState, useEffect } from 'react';
import Link from 'next/link';
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

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem 1rem 1rem;
`;

const TitleSection = styled.div``;

const PageTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.contrast};
  margin: 0 0 0.5rem;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const PageSubtitle = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.85rem;
  color: rgba(224, 224, 224, 0.6);
  margin: 0;
`;

const CreateButton = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-decoration: none;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent}, #2dd84a);
  color: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 15px rgba(57, 255, 20, 0.3);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const EventList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 1rem 1rem;
`;

const EventCard = styled.a`
  display: block;
  background-color: rgba(26, 26, 26, 0.7);
  border: 1px solid rgba(57, 255, 20, 0.2);
  border-radius: 12px;
  padding: 1rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(57, 255, 20, 0.2);
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
`;

const StatusBadge = styled.span<{ $status: string }>`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  background-color: ${({ $status }) => {
    switch ($status) {
      case 'published':
        return 'rgba(57, 255, 20, 0.2)';
      case 'active':
        return 'rgba(255, 45, 149, 0.2)';
      case 'draft':
        return 'rgba(255, 193, 7, 0.2)';
      case 'completed':
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

const EventMeta = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.75rem;
  color: rgba(224, 224, 224, 0.6);
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const BookingStats = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(224, 224, 224, 0.1);
`;

const Stat = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accent};
`;

const StatLabel = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.6rem;
  color: rgba(224, 224, 224, 0.5);
  text-transform: uppercase;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  color: rgba(57, 255, 20, 0.3);
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const EmptyTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.contrast};
  margin: 0 0 0.5rem;
`;

const EmptyText = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.85rem;
  color: rgba(224, 224, 224, 0.5);
  margin: 0 0 1.5rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
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

const SignInPrompt = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  background-color: rgba(26, 26, 26, 0.5);
  border-radius: 12px;
  margin: 0 1rem;
`;

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

interface HostEvent {
  id: string;
  title: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  status: string;
  totalSlots: number;
  bookedSlots: number;
}

export default function HostPage() {
  const { user, isLoading: userLoading } = useUser();
  const [events, setEvents] = useState<HostEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [sdkUsername, setSdkUsername] = useState<string | null>(null);

  // Get username from SDK on mount
  useEffect(() => {
    getSDKUsername().then(setSdkUsername);
  }, []);

  useEffect(() => {
    const username = sdkUsername || user?.username;
    if (!username) {
      setLoading(false);
      return;
    }

    async function fetchEvents() {
      try {
        const response = await fetch(`/api/host/events?username=${encodeURIComponent(username!)}`);
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events || []);
        }
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [user, sdkUsername]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (userLoading || loading) {
    return (
      <AppLayout title="Host | DJ Tap-In Queue">
        <PageHeader>
          <TitleSection>
            <PageTitle>Host</PageTitle>
            <PageSubtitle>Manage your events</PageSubtitle>
          </TitleSection>
        </PageHeader>
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout title="Host | DJ Tap-In Queue">
        <PageHeader>
          <TitleSection>
            <PageTitle>Host</PageTitle>
            <PageSubtitle>Manage your events</PageSubtitle>
          </TitleSection>
        </PageHeader>
        <SignInPrompt>
          <EmptyIcon>
            <CalendarIcon />
          </EmptyIcon>
          <EmptyTitle>Sign In Required</EmptyTitle>
          <EmptyText>Connect your Farcaster account to host events.</EmptyText>
        </SignInPrompt>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Host | DJ Tap-In Queue">
      <PageHeader>
        <TitleSection>
          <PageTitle>Host</PageTitle>
          <PageSubtitle>Manage your events</PageSubtitle>
        </TitleSection>
        <Link href="/host/create" passHref legacyBehavior>
          <CreateButton>
            <PlusIcon />
            Create
          </CreateButton>
        </Link>
      </PageHeader>

      {events.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <CalendarIcon />
          </EmptyIcon>
          <EmptyTitle>No Events Yet</EmptyTitle>
          <EmptyText>Create your first open decks event and let DJs sign up!</EmptyText>
          <Link href="/host/create" passHref legacyBehavior>
            <CreateButton style={{ display: 'inline-flex' }}>
              <PlusIcon />
              Create Event
            </CreateButton>
          </Link>
        </EmptyState>
      ) : (
        <EventList>
          {events.map((event) => (
            <Link key={event.id} href={`/host/${event.id}`} passHref legacyBehavior>
              <EventCard>
                <CardHeader>
                  <EventTitle>{event.title}</EventTitle>
                  <StatusBadge $status={event.status}>{event.status}</StatusBadge>
                </CardHeader>

                <EventMeta>
                  <MetaItem>{formatDate(event.eventDate)}</MetaItem>
                  <MetaItem>
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </MetaItem>
                  <MetaItem>{event.slotDurationMinutes}min sets</MetaItem>
                </EventMeta>

                <BookingStats>
                  <Stat>
                    <StatValue>{event.bookedSlots}</StatValue>
                    <StatLabel>Booked</StatLabel>
                  </Stat>
                  <Stat>
                    <StatValue>{event.totalSlots - event.bookedSlots}</StatValue>
                    <StatLabel>Available</StatLabel>
                  </Stat>
                  <Stat>
                    <StatValue>{event.totalSlots}</StatValue>
                    <StatLabel>Total</StatLabel>
                  </Stat>
                </BookingStats>
              </EventCard>
            </Link>
          ))}
        </EventList>
      )}
    </AppLayout>
  );
}
