import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styled, { ThemeProvider, keyframes } from 'styled-components';
import { theme } from '@/styles/theme';

// Format phone number as user types: (XXX) XXX-XXXX or +1 (XXX) XXX-XXXX
const formatPhoneNumber = (value: string): string => {
  // Strip all non-digit characters except leading +
  const hasPlus = value.startsWith('+');
  const digits = value.replace(/\D/g, '');
  
  if (!digits) return hasPlus ? '+' : '';
  
  // Handle +1 or 1 prefix (US country code)
  let formatted = '';
  let digitIndex = 0;
  
  if (hasPlus || digits.startsWith('1')) {
    // International format: +1 (XXX) XXX-XXXX
    if (digits.startsWith('1')) {
      formatted = '+1 ';
      digitIndex = 1;
    } else {
      formatted = '+';
    }
  }
  
  const remaining = digits.slice(digitIndex);
  
  if (remaining.length === 0) return formatted.trim();
  
  // Format remaining digits as (XXX) XXX-XXXX
  if (remaining.length <= 3) {
    formatted += `(${remaining}`;
  } else if (remaining.length <= 6) {
    formatted += `(${remaining.slice(0, 3)}) ${remaining.slice(3)}`;
  } else {
    formatted += `(${remaining.slice(0, 3)}) ${remaining.slice(3, 6)}-${remaining.slice(6, 10)}`;
  }
  
  return formatted;
};

const glowPulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(57, 255, 20, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(57, 255, 20, 0.5);
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
      linear-gradient(90deg, rgba(57, 255, 20, 0.03) 1px, transparent 1px),
      linear-gradient(rgba(57, 255, 20, 0.03) 1px, transparent 1px);
    background-size: 20px 20px;
    pointer-events: none;
  }
`;

const FormCard = styled.div`
  background: ${({ theme }) => theme.colors.dark};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: 12px;
  padding: 2.5rem;
  max-width: 400px;
  width: 100%;
  position: relative;
  z-index: 1;
  animation: ${glowPulse} 3s ease-in-out infinite;
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.accent};
  text-align: center;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 3px;
`;

const Subtitle = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.contrast};
  opacity: 0.7;
  text-align: center;
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.accent};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Input = styled.input<{ $readOnly?: boolean }>`
  background: ${({ theme, $readOnly }) => $readOnly ? 'rgba(57, 255, 20, 0.05)' : theme.colors.background};
  border: 1px solid ${({ theme, $readOnly }) => $readOnly ? 'rgba(57, 255, 20, 0.3)' : theme.colors.darkGray};
  border-radius: 6px;
  padding: 0.875rem 1rem;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 16px;
  color: ${({ theme, $readOnly }) => $readOnly ? theme.colors.accent : theme.colors.contrast};
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 10px rgba(57, 255, 20, 0.2);
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.contrast};
    opacity: 0.4;
  }
  
  &:read-only {
    cursor: default;
  }
`;

const SubmitButton = styled.button<{ $loading?: boolean }>`
  background: ${({ theme, $loading }) => $loading ? theme.colors.darkGray : theme.colors.accent};
  border: none;
  border-radius: 6px;
  padding: 1rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.background};
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: ${({ $loading }) => $loading ? 'wait' : 'pointer'};
  transition: all 0.2s;
  margin-top: 0.5rem;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(57, 255, 20, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(255, 45, 149, 0.1);
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: 6px;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.secondary};
`;

const LinksContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.darkGray};
`;

const StyledLink = styled(Link)`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.accent};
  text-decoration: none;
  opacity: 0.8;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
`;

export default function RegisterPage() {
  const router = useRouter();
  const { redirect, phone: phoneParam } = router.query;
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get the redirect URL or default to dashboard
  const redirectUrl = typeof redirect === 'string' ? redirect : '/dashboard';

  // Pre-fill phone from query parameter and format it
  useEffect(() => {
    if (typeof phoneParam === 'string') {
      setPhone(formatPhoneNumber(phoneParam));
    }
  }, [phoneParam]);

  // If no phone in query, redirect to login page
  useEffect(() => {
    if (router.isReady && !phoneParam) {
      router.replace(redirect ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login');
    }
  }, [router.isReady, phoneParam, redirect, redirectUrl, router]);

  // Validate username: only letters, numbers, and underscores
  const isValidUsername = (value: string) => /^[A-Za-z0-9_]+$/.test(value);

  // Validate PIN: exactly 4 digits
  const isValidPin = (value: string) => /^\d{4}$/.test(value);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow valid characters as they type
    const value = e.target.value;
    // Filter out invalid characters (only allow letters, numbers, underscores)
    const filtered = value.replace(/[^A-Za-z0-9_]/g, '');
    setUsername(filtered);
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits, max 4 characters
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(value);
  };

  const handleConfirmPinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits, max 4 characters
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setConfirmPin(value);
  };

  // Get pending user data from localStorage (set by Renaissance app auth)
  const getPendingUserData = () => {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem('djq_pending_user_data');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  };

  // Clear pending user data after successful auth
  const clearPendingUserData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('djq_pending_user_data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!isValidUsername(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    if (!isValidPin(pin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setLoading(true);

    try {
      const pendingUserData = getPendingUserData();
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, name, phone, pin, pendingUserData }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Clear pending data and store user
      clearPendingUserData();
      if (data.user) {
        localStorage.setItem('djq_user', JSON.stringify(data.user));
      }

      // Success - use hard redirect to ensure fresh UserContext state
      window.location.href = redirectUrl;
    } catch (err) {
      console.error('Registration error:', err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  // Don't render form until we have the phone parameter
  if (!phoneParam) {
    return (
      <ThemeProvider theme={theme}>
        <Container>
          <FormCard>
            <Title>Redirecting...</Title>
          </FormCard>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Complete Sign Up | DJQ</title>
        <meta name="description" content="Complete your DJQ account" />
      </Head>
      <Container>
        <FormCard>
          <Title>Almost There!</Title>
          <Subtitle>Just a few more details to complete your account</Subtitle>
          
          <Form onSubmit={handleSubmit}>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            <FormGroup>
              <Label>Phone Number</Label>
              <Input
                type="tel"
                value={phone}
                readOnly
                $readOnly
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Username</Label>
              <Input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="your_username"
                required
                autoComplete="username"
                autoFocus
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Display Name</Label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                required
                autoComplete="name"
              />
            </FormGroup>

            <FormGroup>
              <Label>4-Digit PIN</Label>
              <Input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={handlePinChange}
                placeholder="••••"
                required
                maxLength={4}
                autoComplete="new-password"
              />
            </FormGroup>

            <FormGroup>
              <Label>Confirm PIN</Label>
              <Input
                type="password"
                inputMode="numeric"
                value={confirmPin}
                onChange={handleConfirmPinChange}
                placeholder="••••"
                required
                maxLength={4}
                autoComplete="new-password"
              />
            </FormGroup>
            
            <SubmitButton type="submit" disabled={loading || pin.length !== 4 || confirmPin.length !== 4} $loading={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </SubmitButton>
          </Form>
          
          <LinksContainer>
            <StyledLink href={redirect ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login'}>
              Use a different phone number
            </StyledLink>
          </LinksContainer>
        </FormCard>
      </Container>
    </ThemeProvider>
  );
}
