import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import AppLayout from '@/components/layout/AppLayout';
import B2BInviteModal from '@/components/bookings/B2BInviteModal';
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
  color: ${({ theme }) => theme.colors.secondary};
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

const BookingHeader = styled.div`
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
  background-color: ${({ $status }) => 
    $status === 'confirmed' ? 'rgba(57, 255, 20, 0.2)' : 'rgba(224, 224, 224, 0.1)'};
  color: ${({ $status, theme }) => 
    $status === 'confirmed' ? theme.colors.accent : 'rgba(224, 224, 224, 0.6)'};
  border: 1px solid ${({ $status, theme }) => 
    $status === 'confirmed' ? 'rgba(57, 255, 20, 0.4)' : 'rgba(224, 224, 224, 0.2)'};
`;

const EventTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.contrast};
  margin: 0 0 0.5rem;
`;

const SlotTime = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.secondary};
  text-shadow: 0 0 15px rgba(255, 45, 149, 0.4);
  margin-bottom: 0.5rem;
`;

const DateInfo = styled.div`
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

const Card = styled.div`
  background-color: rgba(26, 26, 26, 0.7);
  border: 1px solid rgba(57, 255, 20, 0.15);
  border-radius: 12px;
  padding: 1rem;
`;

const B2BCard = styled(Card)`
  border-color: rgba(255, 45, 149, 0.2);
`;

const B2BStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const B2BAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent}, ${({ theme }) => theme.colors.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.background};
`;

const B2BInfo = styled.div`
  flex: 1;
`;

const B2BName = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.contrast};
`;

const B2BLabel = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.accent};
  text-transform: uppercase;
`;

const NoB2B = styled.div`
  text-align: center;
  padding: 1rem;
`;

const NoB2BText = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.85rem;
  color: rgba(224, 224, 224, 0.5);
  margin: 0 0 1rem;
`;

const InviteButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.secondary};
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 45, 149, 0.1);
    box-shadow: 0 0 15px rgba(255, 45, 149, 0.3);
  }
`;

const PendingRequest = styled.div`
  text-align: center;
  padding: 0.5rem;
`;

const PendingBadge = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.7rem;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  background-color: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.3);
`;

const CancelButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.85rem;
  background-color: transparent;
  color: rgba(224, 224, 224, 0.6);
  border: 1px solid rgba(224, 224, 224, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(224, 224, 224, 0.05);
    color: ${({ theme }) => theme.colors.secondary};
    border-color: rgba(255, 45, 149, 0.3);
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

interface BookingData {
  id: string;
  status: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  slotStartTime: string;
  slotEndTime: string;
  b2bPartner: {
    id: string;
    displayName: string;
    username: string;
  } | null;
  pendingB2BRequest: {
    id: string;
    targetUser: {
      displayName: string;
      username: string;
    };
  } | null;
  allowB2B: boolean;
}

interface User {
  id: string;
  displayName: string;
  username: string;
}

export default function BookingDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!id) return;

    async function fetchBooking() {
      try {
        const response = await fetch(`/api/bookings/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch booking');
        }
        const data = await response.json();
        setBooking(data.booking);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    }

    fetchBooking();
  }, [id]);

  const handleOpenInvite = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(data.users.filter((u: User) => u.id !== user?.id));
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
    setShowInviteModal(true);
  };

  const handleSendInvite = async (targetUserId: string) => {
    setInviteLoading(true);
    try {
      const response = await fetch(`/api/bookings/${id}/b2b`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send invite');
      }

      // Refresh booking data
      router.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invite');
    } finally {
      setInviteLoading(false);
      setShowInviteModal(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    setCancelLoading(true);
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      router.push('/bookings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking');
    } finally {
      setCancelLoading(false);
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <AppLayout title="Booking | DJ Tap-In Queue">
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </AppLayout>
    );
  }

  if (!booking) {
    return (
      <AppLayout title="Booking Not Found | DJ Tap-In Queue">
        <PageContainer>
          <BackButton onClick={() => router.push('/bookings')}>
            <ArrowLeftIcon />
            Back to My Sets
          </BackButton>
          <ErrorMessage>Booking not found</ErrorMessage>
        </PageContainer>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={`${booking.eventTitle} | DJ Tap-In Queue`}>
      <PageContainer>
        <BackButton onClick={() => router.push('/bookings')}>
          <ArrowLeftIcon />
          Back to My Sets
        </BackButton>

        <BookingHeader>
          <StatusBadge $status={booking.status}>{booking.status}</StatusBadge>
          <EventTitle>{booking.eventTitle}</EventTitle>
          <SlotTime>
            {formatTime(booking.slotStartTime)} - {formatTime(booking.slotEndTime)}
          </SlotTime>
          <DateInfo>{formatDate(booking.eventDate)}</DateInfo>
        </BookingHeader>

        {booking.allowB2B && (
          <Section>
            <SectionTitle>B2B Partner</SectionTitle>
            <B2BCard>
              {booking.b2bPartner ? (
                <B2BStatus>
                  <B2BAvatar>{getInitials(booking.b2bPartner.displayName)}</B2BAvatar>
                  <B2BInfo>
                    <B2BName>{booking.b2bPartner.displayName}</B2BName>
                    <B2BLabel>@{booking.b2bPartner.username}</B2BLabel>
                  </B2BInfo>
                </B2BStatus>
              ) : booking.pendingB2BRequest ? (
                <PendingRequest>
                  <PendingBadge>
                    Invite sent to {booking.pendingB2BRequest.targetUser.displayName}
                  </PendingBadge>
                </PendingRequest>
              ) : (
                <NoB2B>
                  <NoB2BText>No B2B partner yet. Invite someone to share the decks!</NoB2BText>
                  <InviteButton onClick={handleOpenInvite}>
                    Invite Partner
                  </InviteButton>
                </NoB2B>
              )}
            </B2BCard>
          </Section>
        )}

        {booking.status === 'confirmed' && (
          <Section>
            <SectionTitle>Actions</SectionTitle>
            <CancelButton onClick={handleCancelBooking} disabled={cancelLoading}>
              {cancelLoading ? 'Cancelling...' : 'Cancel Booking'}
            </CancelButton>
          </Section>
        )}

        {error && <ErrorMessage>{error}</ErrorMessage>}
      </PageContainer>

      <B2BInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSend={handleSendInvite}
        loading={inviteLoading}
        users={availableUsers}
      />
    </AppLayout>
  );
}
