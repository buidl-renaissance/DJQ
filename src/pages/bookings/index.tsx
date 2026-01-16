import { useState, useEffect } from 'react';
import styled from 'styled-components';
import AppLayout from '@/components/layout/AppLayout';
import BookingCard, { BookingCardProps } from '@/components/bookings/BookingCard';
import B2BRequestCard, { B2BRequestCardProps } from '@/components/bookings/B2BRequestCard';
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

const Section = styled.section`
  padding: 0 1rem 1.5rem;
`;

const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.contrast};
  margin: 0 0 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Badge = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.65rem;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.background};
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  color: rgba(255, 45, 149, 0.3);
  
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
  border: 3px solid rgba(255, 45, 149, 0.1);
  border-top-color: ${({ theme }) => theme.colors.secondary};
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

const MusicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

type B2BRequestData = Omit<B2BRequestCardProps, 'onAccept' | 'onDecline' | 'loading'>;

export default function BookingsPage() {
  const { user, isLoading: userLoading } = useUser();
  const [bookings, setBookings] = useState<BookingCardProps[]>([]);
  const [b2bRequests, setB2BRequests] = useState<B2BRequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
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

    async function fetchData() {
      try {
        const [bookingsRes, b2bRes] = await Promise.all([
          fetch(`/api/bookings?username=${encodeURIComponent(username!)}`),
          fetch(`/api/b2b/pending?username=${encodeURIComponent(username!)}`),
        ]);

        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setBookings(bookingsData.bookings || []);
        }

        if (b2bRes.ok) {
          const b2bData = await b2bRes.json();
          setB2BRequests(b2bData.requests || []);
        }
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, sdkUsername]);

  const handleB2BAccept = async (requestId: string) => {
    const username = sdkUsername || user?.username;
    if (!username) return;
    
    setActionLoading(requestId);
    try {
      const response = await fetch(`/api/b2b/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept', username }),
      });

      if (response.ok) {
        // Remove from pending requests
        setB2BRequests((prev) => prev.filter((r) => r.id !== requestId));
        
        // Refresh bookings to show the newly accepted B2B set
        const bookingsRes = await fetch(`/api/bookings?username=${encodeURIComponent(username)}`);
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setBookings(bookingsData.bookings || []);
        }
      }
    } catch (err) {
      console.error('Failed to accept B2B request:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleB2BDecline = async (requestId: string) => {
    const username = sdkUsername || user?.username;
    if (!username) return;
    
    setActionLoading(requestId);
    try {
      const response = await fetch(`/api/b2b/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline', username }),
      });

      if (response.ok) {
        setB2BRequests((prev) => prev.filter((r) => r.id !== requestId));
      }
    } catch (err) {
      console.error('Failed to decline B2B request:', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (userLoading || loading) {
    return (
      <AppLayout title="My Sets | DJ Tap-In Queue">
        <PageHeader>
          <PageTitle>My Sets</PageTitle>
          <PageSubtitle>Your upcoming performances</PageSubtitle>
        </PageHeader>
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout title="My Sets | DJ Tap-In Queue">
        <PageHeader>
          <PageTitle>My Sets</PageTitle>
          <PageSubtitle>Your upcoming performances</PageSubtitle>
        </PageHeader>
        <SignInPrompt>
          <EmptyIcon>
            <MusicIcon />
          </EmptyIcon>
          <EmptyTitle>Sign In Required</EmptyTitle>
          <EmptyText>Connect your Farcaster account to view your bookings.</EmptyText>
        </SignInPrompt>
      </AppLayout>
    );
  }

  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const pastBookings = bookings.filter((b) => b.status === 'cancelled');

  return (
    <AppLayout title="My Sets | DJ Tap-In Queue">
      <PageHeader>
        <PageTitle>My Sets</PageTitle>
        <PageSubtitle>Your upcoming performances</PageSubtitle>
      </PageHeader>

      {b2bRequests.length > 0 && (
        <Section>
          <SectionTitle>
            B2B Requests
            <Badge>{b2bRequests.length}</Badge>
          </SectionTitle>
          <CardList>
            {b2bRequests.map((request) => (
              <B2BRequestCard
                key={request.id}
                {...request}
                onAccept={() => handleB2BAccept(request.id)}
                onDecline={() => handleB2BDecline(request.id)}
                loading={actionLoading === request.id}
              />
            ))}
          </CardList>
        </Section>
      )}

      <Section>
        <SectionTitle>Upcoming Sets</SectionTitle>
        {confirmedBookings.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <MusicIcon />
            </EmptyIcon>
            <EmptyTitle>No Sets Booked</EmptyTitle>
            <EmptyText>Find an event and book your slot to get started.</EmptyText>
          </EmptyState>
        ) : (
          <CardList>
            {confirmedBookings.map((booking) => (
              <BookingCard key={booking.id} {...booking} />
            ))}
          </CardList>
        )}
      </Section>

      {pastBookings.length > 0 && (
        <Section>
          <SectionTitle>Past / Cancelled</SectionTitle>
          <CardList>
            {pastBookings.map((booking) => (
              <BookingCard key={booking.id} {...booking} />
            ))}
          </CardList>
        </Section>
      )}
    </AppLayout>
  );
}
