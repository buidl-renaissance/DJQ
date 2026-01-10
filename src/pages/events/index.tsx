import styled from 'styled-components';
import AppLayout from '@/components/layout/AppLayout';
import EventCard, { EventCardProps } from '@/components/events/EventCard';
import { useState, useEffect } from 'react';

const PageHeader = styled.div`
  padding: 1.5rem 1rem 1rem;
`;

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

const EventList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 1rem 1rem;
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
  margin: 0;
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

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="8" y1="14" x2="8" y2="14" />
    <line x1="12" y1="14" x2="12" y2="14" />
    <line x1="16" y1="14" x2="16" y2="14" />
  </svg>
);

// Event type with slot counts for display
type EventWithSlots = EventCardProps;

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithSlots[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(data.events || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return (
    <AppLayout title="Events | DJ Tap-In Queue">
      <PageHeader>
        <PageTitle>Events</PageTitle>
        <PageSubtitle>Find your next set</PageSubtitle>
      </PageHeader>

      {loading ? (
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      ) : error ? (
        <EmptyState>
          <EmptyTitle>Error</EmptyTitle>
          <EmptyText>{error}</EmptyText>
        </EmptyState>
      ) : events.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <CalendarIcon />
          </EmptyIcon>
          <EmptyTitle>No Events Yet</EmptyTitle>
          <EmptyText>Check back soon for upcoming open decks sessions.</EmptyText>
        </EmptyState>
      ) : (
        <EventList>
          {events.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </EventList>
      )}
    </AppLayout>
  );
}
