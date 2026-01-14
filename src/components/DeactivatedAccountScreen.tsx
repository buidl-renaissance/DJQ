import { useState } from 'react';
import styled from 'styled-components';
import { useUser } from '@/contexts/UserContext';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.dark};
  border: 1px solid rgba(224, 224, 224, 0.1);
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
`;

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  background: rgba(224, 224, 224, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 32px;
    height: 32px;
    color: rgba(224, 224, 224, 0.5);
  }
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.contrast};
  margin: 0 0 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const Description = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.9rem;
  color: rgba(224, 224, 224, 0.6);
  margin: 0 0 2rem;
  line-height: 1.5;
`;

const ReactivateButton = styled.button`
  width: 100%;
  padding: 1rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent}, #2dd84a);
  color: ${({ theme }) => theme.colors.background};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    box-shadow: 0 4px 15px rgba(57, 255, 20, 0.3);
  }
  
  &:disabled {
    background: rgba(224, 224, 224, 0.2);
    color: rgba(224, 224, 224, 0.4);
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: rgba(255, 45, 149, 0.1);
  border: 1px solid rgba(255, 45, 149, 0.3);
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.secondary};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.8rem;
`;

const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="10" y1="15" x2="10" y2="9" />
    <line x1="14" y1="15" x2="14" y2="9" />
  </svg>
);

export default function DeactivatedAccountScreen() {
  const { refreshUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReactivate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/user/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reactivate' }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reactivate account');
      }
      
      // Refresh user data to get updated status
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reactivate account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <IconWrapper>
          <PauseIcon />
        </IconWrapper>
        <Title>Account Deactivated</Title>
        <Description>
          Your account is currently deactivated. Reactivate it to access the app and your bookings again.
        </Description>
        <ReactivateButton onClick={handleReactivate} disabled={loading}>
          {loading ? 'Reactivating...' : 'Reactivate Account'}
        </ReactivateButton>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Card>
    </Container>
  );
}
