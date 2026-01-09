import styled, { css } from 'styled-components';

type SlotStatus = 'available' | 'booked' | 'yours' | 'selected' | 'in_progress' | 'completed';

interface ChipProps {
  $status: SlotStatus;
  $isSelectable: boolean;
}

const Chip = styled.button<ChipProps>`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.7rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid;
  cursor: ${({ $isSelectable }) => ($isSelectable ? 'pointer' : 'default')};
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-width: 70px;
  position: relative;
  
  ${({ $status, theme, $isSelectable }) => {
    switch ($status) {
      case 'available':
        return css`
          background-color: rgba(57, 255, 20, 0.1);
          border-color: rgba(57, 255, 20, 0.3);
          color: ${theme.colors.accent};
          
          ${$isSelectable && css`
            &:hover {
              background-color: rgba(57, 255, 20, 0.2);
              border-color: ${theme.colors.accent};
              box-shadow: 0 0 10px rgba(57, 255, 20, 0.3);
            }
            
            &:active {
              transform: scale(0.98);
            }
          `}
        `;
      case 'selected':
        return css`
          background-color: rgba(57, 255, 20, 0.3);
          border-color: ${theme.colors.accent};
          color: ${theme.colors.accent};
          box-shadow: 0 0 15px rgba(57, 255, 20, 0.4);
          
          &::after {
            content: '✓';
            position: absolute;
            top: -6px;
            right: -6px;
            background: ${theme.colors.accent};
            color: ${theme.colors.background};
            width: 16px;
            height: 16px;
            border-radius: 50%;
            font-size: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `;
      case 'booked':
        return css`
          background-color: rgba(224, 224, 224, 0.05);
          border-color: rgba(224, 224, 224, 0.15);
          color: rgba(224, 224, 224, 0.4);
          cursor: not-allowed;
        `;
      case 'yours':
        return css`
          background-color: rgba(255, 45, 149, 0.2);
          border-color: rgba(255, 45, 149, 0.5);
          color: ${theme.colors.secondary};
          box-shadow: 0 0 10px rgba(255, 45, 149, 0.2);
        `;
      case 'in_progress':
        return css`
          background-color: rgba(255, 45, 149, 0.3);
          border-color: ${theme.colors.secondary};
          color: ${theme.colors.secondary};
          animation: pulse 2s ease-in-out infinite;
          
          @keyframes pulse {
            0%, 100% { box-shadow: 0 0 5px rgba(255, 45, 149, 0.3); }
            50% { box-shadow: 0 0 15px rgba(255, 45, 149, 0.6); }
          }
        `;
      case 'completed':
        return css`
          background-color: rgba(224, 224, 224, 0.05);
          border-color: rgba(224, 224, 224, 0.1);
          color: rgba(224, 224, 224, 0.3);
          cursor: not-allowed;
        `;
      default:
        return css`
          background-color: rgba(224, 224, 224, 0.05);
          border-color: rgba(224, 224, 224, 0.1);
          color: rgba(224, 224, 224, 0.5);
        `;
    }
  }}
`;

const Time = styled.span`
  font-weight: 700;
  font-size: 0.75rem;
`;

const Status = styled.span`
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
`;

export interface SlotChipProps {
  id: string;
  startTime: Date;
  endTime: Date;
  status: SlotStatus;
  isSelected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  djName?: string;
}

export default function SlotChip({
  startTime,
  status,
  isSelected,
  onClick,
  disabled,
  djName,
}: SlotChipProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const displayStatus = isSelected ? 'selected' : status;
  const isSelectable = status === 'available' && !disabled;

  const getStatusLabel = () => {
    if (isSelected) return 'Selected';
    switch (status) {
      case 'available':
        return 'Open';
      case 'booked':
        return djName || 'Booked';
      case 'yours':
        return 'Your Set';
      case 'in_progress':
        return 'Live';
      case 'completed':
        return 'Done';
      default:
        return status;
    }
  };

  return (
    <Chip
      $status={displayStatus}
      $isSelectable={isSelectable}
      onClick={isSelectable ? onClick : undefined}
      disabled={!isSelectable}
      type="button"
    >
      <Time>{formatTime(startTime)}</Time>
      <Status>{getStatusLabel()}</Status>
    </Chip>
  );
}
