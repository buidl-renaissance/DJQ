import { useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import AppLayout from '@/components/layout/AppLayout';
import EventForm, { EventFormData } from '@/components/host/EventForm';
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

const PageTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.contrast};
  margin: 0 0 1.5rem;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const ErrorMessage = styled.div`
  background-color: rgba(255, 45, 149, 0.1);
  border: 1px solid rgba(255, 45, 149, 0.3);
  border-radius: 8px;
  padding: 1rem;
  color: ${({ theme }) => theme.colors.secondary};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.85rem;
  margin-bottom: 1rem;
`;

const SignInPrompt = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  background-color: rgba(26, 26, 26, 0.5);
  border-radius: 12px;
`;

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12,19 5,12 12,5" />
  </svg>
);

export default function CreateEventPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: EventFormData, publish: boolean) => {
    setLoading(true);
    setError(null);

    try {
      // Combine date and time into ISO strings
      const eventDate = new Date(`${data.eventDate}T00:00:00`);
      const startTime = new Date(`${data.eventDate}T${data.startTime}`);
      const endTime = new Date(`${data.eventDate}T${data.endTime}`);

      if (!user?.username) {
        throw new Error('User must be logged in with a username');
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          title: data.title,
          description: data.description || null,
          eventDate: eventDate.toISOString(),
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          slotDurationMinutes: data.slotDurationMinutes,
          allowConsecutiveSlots: data.allowConsecutiveSlots,
          maxConsecutiveSlots: data.maxConsecutiveSlots,
          allowB2B: data.allowB2B,
          publish,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to create event');
      }

      const result = await response.json();
      router.push(`/host/${result.event.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Create Event | DJ Tap-In Queue">
        <PageContainer>
          <PageTitle>Create Event</PageTitle>
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
        </PageContainer>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout title="Create Event | DJ Tap-In Queue">
        <PageContainer>
          <BackButton onClick={() => router.push('/host')}>
            <ArrowLeftIcon />
            Back
          </BackButton>
          <PageTitle>Create Event</PageTitle>
          <SignInPrompt>
            <p style={{ color: 'rgba(224, 224, 224, 0.6)' }}>
              Please sign in to create an event.
            </p>
          </SignInPrompt>
        </PageContainer>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Create Event | DJ Tap-In Queue">
      <PageContainer>
        <BackButton onClick={() => router.push('/host')}>
          <ArrowLeftIcon />
          Back
        </BackButton>

        <PageTitle>Create Event</PageTitle>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <EventForm onSubmit={handleSubmit} loading={loading} />
      </PageContainer>
    </AppLayout>
  );
}
