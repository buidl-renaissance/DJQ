import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styled, { ThemeProvider, keyframes } from 'styled-components';
import { theme } from '@/styles/theme';

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

const Input = styled.input`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.darkGray};
  border-radius: 6px;
  padding: 0.875rem 1rem;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.contrast};
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

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.darkGray};
  }
`;

const DividerText = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.contrast};
  opacity: 0.5;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const FarcasterButton = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: 6px;
  padding: 1rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.secondary};
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  
  &:hover {
    background: rgba(255, 45, 149, 0.1);
    transform: translateY(-2px);
  }
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

export default function LoginPage() {
  const router = useRouter();
  const { redirect } = router.query;
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get the redirect URL or default to dashboard
  const redirectUrl = typeof redirect === 'string' ? redirect : '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/phone-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Success - redirect to original page or dashboard
      router.push(redirectUrl);
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleFarcasterLogin = () => {
    // Redirect to home page which has Farcaster auth, with redirect param
    const homeUrl = redirect ? `/?redirect=${encodeURIComponent(redirectUrl)}` : '/';
    router.push(homeUrl);
  };

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Login | DJQ</title>
        <meta name="description" content="Login to your DJQ account" />
      </Head>
      <Container>
        <FormCard>
          <Title>Welcome Back</Title>
          <Subtitle>Enter your phone number to continue</Subtitle>
          
          <Form onSubmit={handleSubmit}>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            <FormGroup>
              <Label>Phone Number</Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 123 4567"
                required
                autoComplete="tel"
                autoFocus
              />
            </FormGroup>
            
            <SubmitButton type="submit" disabled={loading} $loading={loading}>
              {loading ? 'Logging in...' : 'Continue'}
            </SubmitButton>
          </Form>
          
          <Divider>
            <DividerText>or</DividerText>
          </Divider>
          
          <FarcasterButton type="button" onClick={handleFarcasterLogin}>
            Login with Farcaster
          </FarcasterButton>
          
          <LinksContainer>
            <StyledLink href={redirect ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : '/register'}>
              Don&apos;t have an account? Sign up
            </StyledLink>
          </LinksContainer>
        </FormCard>
      </Container>
    </ThemeProvider>
  );
}
