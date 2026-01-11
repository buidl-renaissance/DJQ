import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styled, { ThemeProvider, keyframes } from 'styled-components';
import { theme } from '@/styles/theme';
import { useUser } from '@/contexts/UserContext';
import EventSlotCard from '@/components/bookings/EventSlotCard';

interface BookingInvite {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  slotStartTime: string;
  slotEndTime: string;
  booker: {
    id: string;
    displayName: string;
    username: string;
    pfpUrl?: string;
  };
  b2bPartners: {
    id: string;
    displayName: string;
    username: string;
  }[];
  allowB2B: boolean;
  maxB2BPartners: number;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      linear-gradient(90deg, rgba(255, 45, 149, 0.02) 1px, transparent 1px),
      linear-gradient(rgba(255, 45, 149, 0.02) 1px, transparent 1px);
    background-size: 25px 25px;
    pointer-events: none;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  position: relative;
  z-index: 1;
`;

const LoadingSpinner = styled.div`
  width: 100px;
  height: 100px;
  background-color: ${({ theme }) => theme.colors.dark};
  border: 3px solid ${({ theme }) => theme.colors.darkGray};
  border-top-color: ${({ theme }) => theme.colors.secondary};
  border-right-color: ${({ theme }) => theme.colors.accent};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  box-shadow: 
    0 0 20px rgba(255, 45, 149, 0.3),
    inset 0 0 20px rgba(57, 255, 20, 0.1);
`;

const LoadingLabel = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.secondary};
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const ContentWrapper = styled.div`
  max-width: 420px;
  width: 100%;
  position: relative;
  z-index: 1;
  animation: ${fadeIn} 0.5s ease-out;
`;

const InviteHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.darkGray};
`;

const B2BIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.secondary}, #ff6eb4);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const InviteTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.secondary};
  text-transform: uppercase;
  letter-spacing: 3px;
  margin: 0 0 0.5rem;
`;

const InviterName = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.contrast};
  margin: 0;
  
  strong {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const EventCardWrapper = styled.div`
  margin-bottom: 1.5rem;
`;

const FormSection = styled.div`
  margin-top: 1.5rem;
  padding: 1.25rem;
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: 12px;
  background: rgba(255, 45, 149, 0.05);
`;

const SectionTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.accent};
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0 0 1rem;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const Label = styled.label`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.65rem;
  color: ${({ theme }) => theme.colors.secondary};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Input = styled.input`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.darkGray};
  border-radius: 6px;
  padding: 0.75rem 1rem;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 16px;
  color: ${({ theme }) => theme.colors.contrast};
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.secondary};
    box-shadow: 0 0 10px rgba(255, 45, 149, 0.2);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.contrast};
    opacity: 0.4;
  }
`;

const OptionalTag = styled.span`
  font-size: 0.6rem;
  color: ${({ theme }) => theme.colors.contrast};
  opacity: 0.5;
  margin-left: 0.5rem;
  text-transform: lowercase;
`;

const AcceptButton = styled.button<{ $loading?: boolean }>`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.secondary}, #ff6eb4);
  border: none;
  border-radius: 8px;
  padding: 1rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.background};
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: ${({ $loading }) => $loading ? 'wait' : 'pointer'};
  transition: all 0.2s;
  margin-top: 0.5rem;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(255, 45, 149, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(255, 45, 149, 0.15);
  border: 1px solid rgba(255, 45, 149, 0.4);
  border-radius: 6px;
  padding: 0.75rem 1rem;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.secondary};
  text-align: center;
`;

const SuccessMessage = styled.div`
  background: rgba(57, 255, 20, 0.15);
  border: 1px solid rgba(57, 255, 20, 0.4);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
`;

const SuccessIcon = styled.div`
  width: 56px;
  height: 56px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent}, #2dd84a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 28px;
    height: 28px;
    color: ${({ theme }) => theme.colors.background};
  }
`;

const SuccessTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.accent};
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0 0 0.5rem;
`;

const SuccessText = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.contrast};
  margin: 0;
  opacity: 0.8;
`;

const AlreadyTakenMessage = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.darkGray};
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.contrast};
  opacity: 0.7;
`;

const LoggedInMessage = styled.div`
  text-align: center;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  margin-bottom: 1rem;
  
  p {
    font-family: ${({ theme }) => theme.fonts.body};
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.contrast};
    margin: 0;
    
    strong {
      color: ${({ theme }) => theme.colors.accent};
    }
  }
`;

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

export default function B2BInvitePage() {
  const router = useRouter();
  const { bookingId } = router.query;
  const { user, isLoading: userLoading } = useUser();

  const [booking, setBooking] = useState<BookingInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state for new users
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!bookingId || typeof bookingId !== 'string') return;

    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to load invite');
        }
        const data = await res.json();
        setBooking(data.booking);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load invite');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handleAcceptAsLoggedInUser = async () => {
    if (!user?.username || !booking?.booker?.username) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/bookings/${bookingId}/b2b`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          targetUsername: booking.booker.username,
          fromSharedInvite: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to accept invite');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invite');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterAndAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking?.booker?.username) return;

    setSubmitting(true);
    setError(null);

    try {
      // First, register the new user
      const registerRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, name, phone, email: email || undefined }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        throw new Error(registerData.error || 'Registration failed');
      }

      // Then, accept the B2B invite
      const b2bRes = await fetch(`/api/bookings/${bookingId}/b2b`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          targetUsername: booking.booker.username,
          fromSharedInvite: true,
        }),
      });

      if (!b2bRes.ok) {
        const b2bData = await b2bRes.json();
        throw new Error(b2bData.error || 'Failed to accept invite');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  // Only wait for booking to load, not user auth (which can be slow)
  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Head>
          <title>B2B Invite | DJQ</title>
        </Head>
        <Container>
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingLabel>Loading invite...</LoadingLabel>
          </LoadingContainer>
        </Container>
      </ThemeProvider>
    );
  }

  if (error && !booking) {
    return (
      <ThemeProvider theme={theme}>
        <Head>
          <title>B2B Invite | DJQ</title>
        </Head>
        <Container>
          <ContentWrapper>
            <ErrorMessage>{error}</ErrorMessage>
          </ContentWrapper>
        </Container>
      </ThemeProvider>
    );
  }

  if (!booking) {
    return (
      <ThemeProvider theme={theme}>
        <Head>
          <title>B2B Invite | DJQ</title>
        </Head>
        <Container>
          <ContentWrapper>
            <ErrorMessage>Invite not found</ErrorMessage>
          </ContentWrapper>
        </Container>
      </ThemeProvider>
    );
  }

  // Check if this is the booking owner viewing their own invite page
  const isOwnInvite = user?.id === booking.booker?.id;

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>B2B Invite from @{booking.booker?.username} | DJQ</title>
        <meta name="description" content={`Join ${booking.booker?.displayName} for a B2B set at ${booking.eventTitle}`} />
      </Head>
      <Container>
        <ContentWrapper>
          <InviteHeader>
            <B2BIcon>🎧</B2BIcon>
            <InviteTitle>B2B Invite</InviteTitle>
            <InviterName>
              Go B2B with <strong>@{booking.booker?.username}</strong>
            </InviterName>
          </InviteHeader>

          <EventCardWrapper>
            <EventSlotCard
              eventTitle={booking.eventTitle}
              eventDate={booking.eventDate}
              slotStartTime={booking.slotStartTime}
              slotEndTime={booking.slotEndTime}
            />
          </EventCardWrapper>

          {success ? (
            <SuccessMessage>
              <SuccessIcon>
                <CheckIcon />
              </SuccessIcon>
              <SuccessTitle>You&apos;re In!</SuccessTitle>
              <SuccessText>
                You and @{booking.booker?.username} are now B2B partners for this set.
              </SuccessText>
            </SuccessMessage>
          ) : booking.b2bPartners.length >= booking.maxB2BPartners ? (
            <AlreadyTakenMessage>
              This slot already has the maximum B2B partners ({booking.b2bPartners.map(p => '@' + p.username).join(', ')})
            </AlreadyTakenMessage>
          ) : isOwnInvite ? (
            <AlreadyTakenMessage>
              This is your booking. Share this link with someone you want to go B2B with!
            </AlreadyTakenMessage>
          ) : userLoading ? (
            <FormSection>
              <SectionTitle>Checking account...</SectionTitle>
            </FormSection>
          ) : user ? (
            <FormSection>
              <LoggedInMessage>
                <p>Logged in as <strong>@{user.username}</strong></p>
              </LoggedInMessage>
              {error && <ErrorMessage>{error}</ErrorMessage>}
              <AcceptButton
                onClick={handleAcceptAsLoggedInUser}
                disabled={submitting}
                $loading={submitting}
              >
                {submitting ? 'Joining...' : 'Accept & Join as B2B Partner'}
              </AcceptButton>
            </FormSection>
          ) : (
            <FormSection>
              <SectionTitle>Create Account & Accept</SectionTitle>
              <Form onSubmit={handleRegisterAndAccept}>
                {error && <ErrorMessage>{error}</ErrorMessage>}
                
                <FormGroup>
                  <Label>Username</Label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="your_username"
                    required
                    autoComplete="username"
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Name</Label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Display Name"
                    required
                    autoComplete="name"
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 123 4567"
                    required
                    autoComplete="tel"
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>
                    Email
                    <OptionalTag>(optional)</OptionalTag>
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </FormGroup>
                
                <AcceptButton type="submit" disabled={submitting} $loading={submitting}>
                  {submitting ? 'Creating & Joining...' : 'Create Account & Join'}
                </AcceptButton>
              </Form>
            </FormSection>
          )}
        </ContentWrapper>
      </Container>
    </ThemeProvider>
  );
}
