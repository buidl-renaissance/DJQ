import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useUser } from '@/contexts/UserContext';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: ${fadeIn} 0.2s ease-out;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.dark};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  animation: ${slideUp} 0.3s ease-out;
  box-shadow: 0 0 30px rgba(57, 255, 20, 0.2);
`;

const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.accent};
  text-align: center;
  margin: 0 0 0.5rem;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const Subtitle = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.contrast};
  opacity: 0.7;
  text-align: center;
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
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
  font-size: 16px;
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

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(57, 255, 20, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SkipButton = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.darkGray};
  border-radius: 6px;
  padding: 0.75rem;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.contrast};
  opacity: 0.6;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    opacity: 1;
    border-color: ${({ theme }) => theme.colors.contrast};
  }
`;

const ErrorMessage = styled.div`
  background: rgba(255, 45, 149, 0.1);
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: 6px;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 1rem;
`;

// Format phone number as user types: (XXX) XXX-XXXX or +1 (XXX) XXX-XXXX
const formatPhoneNumber = (value: string): string => {
  const hasPlus = value.startsWith('+');
  const digits = value.replace(/\D/g, '');
  
  if (!digits) return hasPlus ? '+' : '';
  
  let formatted = '';
  let digitIndex = 0;
  
  if (hasPlus || digits.startsWith('1')) {
    if (digits.startsWith('1')) {
      formatted = '+1 ';
      digitIndex = 1;
    } else {
      formatted = '+';
    }
  }
  
  const remaining = digits.slice(digitIndex);
  
  if (remaining.length === 0) return formatted.trim();
  
  if (remaining.length <= 3) {
    formatted += `(${remaining}`;
  } else if (remaining.length <= 6) {
    formatted += `(${remaining.slice(0, 3)}) ${remaining.slice(3)}`;
  } else {
    formatted += `(${remaining.slice(0, 3)}) ${remaining.slice(3, 6)}-${remaining.slice(6, 10)}`;
  }
  
  return formatted;
};

interface PhonePromptModalProps {
  onComplete?: () => void;
}

export default function PhonePromptModal({ onComplete }: PhonePromptModalProps) {
  const { user, setNeedsPhone, refreshUser } = useUser();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if user needs to set a PIN (new users from Renaissance)
  const needsPin = user && !user.hasPin && !user.pinHash;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(value);
  };

  const handleConfirmPinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setConfirmPin(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Normalize phone number
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');

    if (!normalizedPhone || normalizedPhone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid phone number');
      setLoading(false);
      return;
    }

    // Validate PIN if needed
    if (needsPin) {
      if (pin.length !== 4) {
        setError('PIN must be exactly 4 digits');
        setLoading(false);
        return;
      }
      if (pin !== confirmPin) {
        setError('PINs do not match');
        setLoading(false);
        return;
      }
    }

    try {
      // First update phone number
      const phoneRes = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone }),
        credentials: 'include',
      });

      const phoneData = await phoneRes.json();

      if (!phoneRes.ok) {
        setError(phoneData.error || 'Failed to save phone number');
        setLoading(false);
        return;
      }

      // If user needs PIN, set it
      if (needsPin) {
        const pinRes = await fetch('/api/user/set-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin }),
          credentials: 'include',
        });

        const pinData = await pinRes.json();

        if (!pinRes.ok) {
          setError(pinData.error || 'Failed to set PIN');
          setLoading(false);
          return;
        }
      }

      // Refresh user to get updated data
      await refreshUser();

      setNeedsPhone(false);
      onComplete?.();
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setNeedsPhone(false);
    onComplete?.();
  };

  if (!user) return null;

  return (
    <Overlay>
      <Modal>
        <Title>Welcome!</Title>
        <Subtitle>
          {needsPin 
            ? 'Complete your profile to continue'
            : 'Add your phone number so hosts can reach you about bookings'
          }
        </Subtitle>
        
        <form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <FormGroup>
            <Label>Phone Number</Label>
            <Input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="+1 (555) 123-4567"
              autoComplete="tel"
              autoFocus
            />
          </FormGroup>

          {needsPin && (
            <>
              <FormGroup>
                <Label>Create 4-Digit PIN</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={pin}
                  onChange={handlePinChange}
                  placeholder="0000"
                  maxLength={4}
                  autoComplete="off"
                />
              </FormGroup>

              <FormGroup>
                <Label>Confirm PIN</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={confirmPin}
                  onChange={handleConfirmPinChange}
                  placeholder="0000"
                  maxLength={4}
                  autoComplete="off"
                />
              </FormGroup>
            </>
          )}
          
          <ButtonGroup>
            <SubmitButton 
              type="submit" 
              disabled={loading || (needsPin && (pin.length !== 4 || confirmPin.length !== 4))} 
              $loading={loading}
            >
              {loading ? 'Saving...' : needsPin ? 'Complete Setup' : 'Save Phone Number'}
            </SubmitButton>
            {!needsPin && (
              <SkipButton type="button" onClick={handleSkip}>
                Skip for now
              </SkipButton>
            )}
          </ButtonGroup>
        </form>
      </Modal>
    </Overlay>
  );
}
