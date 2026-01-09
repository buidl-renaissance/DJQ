import styled from 'styled-components';

const Card = styled.div`
  background-color: rgba(26, 26, 26, 0.7);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 12px;
  padding: 1rem;
  position: relative;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent}, ${({ theme }) => theme.colors.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.background};
`;

const RequestInfo = styled.div`
  flex: 1;
`;

const RequesterName = styled.h4`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.95rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.contrast};
  margin: 0 0 0.25rem;
`;

const RequestType = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.7rem;
  color: rgba(224, 224, 224, 0.6);
`;

const SlotInfo = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.8rem;
  color: rgba(224, 224, 224, 0.7);
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button<{ $variant: 'accept' | 'decline' }>`
  flex: 1;
  padding: 0.75rem;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ $variant, theme }) => $variant === 'accept' ? `
    background-color: rgba(57, 255, 20, 0.2);
    border: 1px solid ${theme.colors.accent};
    color: ${theme.colors.accent};
    
    &:hover {
      background-color: rgba(57, 255, 20, 0.3);
      box-shadow: 0 0 10px rgba(57, 255, 20, 0.3);
    }
  ` : `
    background-color: transparent;
    border: 1px solid rgba(224, 224, 224, 0.3);
    color: rgba(224, 224, 224, 0.7);
    
    &:hover {
      background-color: rgba(224, 224, 224, 0.1);
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export interface B2BRequestCardProps {
  id: string;
  requesterName: string;
  requesterUsername?: string;
  eventTitle: string;
  slotTime: string;
  initiatedBy: 'booker' | 'requester';
  onAccept: () => void;
  onDecline: () => void;
  loading?: boolean;
}

export default function B2BRequestCard({
  requesterName,
  requesterUsername,
  eventTitle,
  slotTime,
  initiatedBy,
  onAccept,
  onDecline,
  loading,
}: B2BRequestCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const requestTypeText = initiatedBy === 'booker' 
    ? 'invited you to B2B'
    : 'wants to B2B with you';

  return (
    <Card>
      <CardHeader>
        <Avatar>{getInitials(requesterName)}</Avatar>
        <RequestInfo>
          <RequesterName>
            {requesterName}
            {requesterUsername && <span style={{ opacity: 0.5, fontWeight: 400 }}> @{requesterUsername}</span>}
          </RequesterName>
          <RequestType>{requestTypeText}</RequestType>
        </RequestInfo>
      </CardHeader>

      <SlotInfo>
        <strong>{eventTitle}</strong>
        <br />
        {slotTime}
      </SlotInfo>

      <ButtonRow>
        <Button $variant="decline" onClick={onDecline} disabled={loading}>
          Decline
        </Button>
        <Button $variant="accept" onClick={onAccept} disabled={loading}>
          Accept
        </Button>
      </ButtonRow>
    </Card>
  );
}
