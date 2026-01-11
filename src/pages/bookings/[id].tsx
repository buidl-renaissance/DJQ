import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import AppLayout from '@/components/layout/AppLayout';
import B2BInviteModal from '@/components/bookings/B2BInviteModal';
import { useUser } from '@/contexts/UserContext';
import { share, getBaseUrl } from '@/lib/share';

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
  border: 1px solid ${({ $status }) => 
    $status === 'confirmed' ? 'rgba(57, 255, 20, 0.4)' : 'rgba(224, 224, 224, 0.2)'};
`;

const ConfirmationBanner = styled.div`
  background: linear-gradient(135deg, rgba(57, 255, 20, 0.15), rgba(45, 216, 74, 0.15));
  border: 1px solid rgba(57, 255, 20, 0.4);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  text-align: center;
  animation: fadeIn 0.5s ease-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ConfirmationIcon = styled.div`
  width: 48px;
  height: 48px;
  margin: 0 auto 0.75rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent}, #2dd84a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(57, 255, 20, 0.5);
  
  svg {
    width: 24px;
    height: 24px;
    color: ${({ theme }) => theme.colors.background};
  }
`;

const ConfirmationTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accent};
  margin: 0 0 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ConfirmationText = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.85rem;
  color: rgba(224, 224, 224, 0.8);
  margin: 0;
`;

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

const EventTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.contrast};
  margin: 0 0 0.5rem;
`;

const SlotTime = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.5rem;
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

const SlotCountBadge = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  background-color: rgba(57, 255, 20, 0.15);
  color: ${({ theme }) => theme.colors.accent};
  border: 1px solid rgba(57, 255, 20, 0.3);
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

const B2BPartnersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const B2BStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const B2BSlotIndicator = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.7rem;
  color: rgba(224, 224, 224, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(224, 224, 224, 0.1);
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

const ShareB2BButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  margin-top: 0.75rem;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.8rem;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.accent};
  border: 1px dashed ${({ theme }) => theme.colors.accent};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background-color: rgba(57, 255, 20, 0.05);
    border-style: solid;
  }
`;

const ShareFeedback = styled.span`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.accent};
  margin-left: 0.25rem;
`;

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

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
  bookingIds?: string[];
  slotCount?: number;
  status: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  slotStartTime: string;
  slotEndTime: string;
  booker: {
    id: string;
    displayName: string;
    username: string;
  } | null;
  b2bPartners: {
    id: string;
    displayName: string;
    username: string;
  }[];
  pendingB2BRequests: {
    id: string;
    targetUser: {
      displayName: string;
      username: string;
    };
  }[];
  allowB2B: boolean;
  maxB2BPartners: number;
}

interface User {
  id: string;
  displayName: string;
  username: string;
}

export default function BookingDetailPage() {
  const router = useRouter();
  const { id, confirmed } = router.query;
  const { user } = useUser();

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const showConfirmation = confirmed === 'true';
  
  // Clear the confirmation query param after showing
  useEffect(() => {
    if (confirmed === 'true') {
      // Remove the query param from URL without reload
      const url = new URL(window.location.href);
      url.searchParams.delete('confirmed');
      window.history.replaceState({}, '', url.pathname);
    }
  }, [confirmed]);

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

  const handleShareB2BInvite = async () => {
    if (!booking) return;

    const formatTimeRange = () => {
      const start = new Date(booking.slotStartTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      const end = new Date(booking.slotEndTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      return `${start} - ${end}`;
    };

    // Link to the dedicated B2B invite page
    const b2bUrl = `${getBaseUrl()}/b2b/${booking.id}`;
    const displayName = user?.displayName || user?.username || 'A DJ';
    
    const result = await share({
      title: `B2B Invite: ${booking.eventTitle}`,
      text: `${displayName} wants you to go B2B at ${booking.eventTitle} (${formatTimeRange()})! Join them on the decks.`,
      url: b2bUrl,
    });

    if (result === 'copied') {
      setShareFeedback('Link copied!');
      setTimeout(() => setShareFeedback(null), 2000);
    } else if (result === 'shared') {
      setShareFeedback('Shared!');
      setTimeout(() => setShareFeedback(null), 2000);
    }
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
    const slotCount = booking?.slotCount || 1;
    const message = slotCount > 1 
      ? `Are you sure you want to cancel this set? This will cancel all ${slotCount} slots.`
      : 'Are you sure you want to cancel this booking?';
    
    if (!confirm(message)) return;

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

        {showConfirmation && (
          <ConfirmationBanner>
            <ConfirmationIcon>
              <CheckIcon />
            </ConfirmationIcon>
            <ConfirmationTitle>You&apos;re Booked!</ConfirmationTitle>
            <ConfirmationText>
              Your set has been confirmed. See you on the decks!
            </ConfirmationText>
          </ConfirmationBanner>
        )}

        <BookingHeader>
          <StatusBadge $status={booking.status}>{booking.status}</StatusBadge>
          <EventTitle>{booking.eventTitle}</EventTitle>
          <SlotTime>
            <span>{formatTime(booking.slotStartTime)} - {formatTime(booking.slotEndTime)}</span>
            {booking.slotCount && booking.slotCount > 1 && (
              <SlotCountBadge>{booking.slotCount} slots</SlotCountBadge>
            )}
          </SlotTime>
          <DateInfo>{formatDate(booking.eventDate)}</DateInfo>
        </BookingHeader>

        {booking.allowB2B && (
          <Section>
            <SectionTitle>B2B Partners</SectionTitle>
            <B2BCard>
              <B2BSlotIndicator>
                {booking.b2bPartners.length + 1} of 3 participants
              </B2BSlotIndicator>
              
              <B2BPartnersList>
                {/* Show existing partners */}
                {booking.b2bPartners.map((partner) => (
                  <B2BStatus key={partner.id}>
                    <B2BAvatar>{getInitials(partner.displayName)}</B2BAvatar>
                    <B2BInfo>
                      <B2BName>{partner.displayName}</B2BName>
                      <B2BLabel>@{partner.username}</B2BLabel>
                    </B2BInfo>
                  </B2BStatus>
                ))}

                {/* Show pending invites */}
                {booking.pendingB2BRequests.map((request) => (
                  <PendingRequest key={request.id}>
                    <PendingBadge>
                      Invite sent to {request.targetUser.displayName}
                    </PendingBadge>
                  </PendingRequest>
                ))}

                {/* Show invite option if there's room for more partners */}
                {booking.b2bPartners.length + booking.pendingB2BRequests.length < booking.maxB2BPartners && (
                  <NoB2B>
                    {booking.b2bPartners.length === 0 && booking.pendingB2BRequests.length === 0 && (
                      <NoB2BText>No B2B partners yet. Invite someone to share the decks!</NoB2BText>
                    )}
                    {(booking.b2bPartners.length > 0 || booking.pendingB2BRequests.length > 0) && (
                      <NoB2BText>Room for {booking.maxB2BPartners - booking.b2bPartners.length - booking.pendingB2BRequests.length} more partner{booking.maxB2BPartners - booking.b2bPartners.length - booking.pendingB2BRequests.length > 1 ? 's' : ''}</NoB2BText>
                    )}
                    <InviteButton onClick={handleOpenInvite}>
                      Invite Partner
                    </InviteButton>
                    <ShareB2BButton onClick={handleShareB2BInvite}>
                      <ShareIcon />
                      Share B2B Invite Link
                      {shareFeedback && <ShareFeedback>{shareFeedback}</ShareFeedback>}
                    </ShareB2BButton>
                  </NoB2B>
                )}
              </B2BPartnersList>
            </B2BCard>
          </Section>
        )}

        {booking.status === 'confirmed' && (
          <Section>
            <SectionTitle>Actions</SectionTitle>
            <CancelButton onClick={handleCancelBooking} disabled={cancelLoading}>
              {cancelLoading 
                ? 'Cancelling...' 
                : booking.slotCount && booking.slotCount > 1 
                  ? `Cancel Set (${booking.slotCount} slots)`
                  : 'Cancel Booking'}
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
