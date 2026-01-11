import styled from 'styled-components';
import { useState } from 'react';

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SlotRow = styled.button<{ 
  $status: 'available' | 'booked' | 'yours' | 'selected' | 'in_progress' | 'completed';
  $isSelectable: boolean;
  $isInHoverWindow?: boolean;
  $canStartWindow?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  border: 1px solid;
  background: transparent;
  cursor: ${({ $isSelectable }) => ($isSelectable ? 'pointer' : 'default')};
  transition: all 0.2s ease;
  
  ${({ $status, $isInHoverWindow, $canStartWindow, theme }) => {
    // Hover window highlight takes precedence for available slots
    if ($isInHoverWindow && $status === 'available') {
      return `
        border-color: ${theme.colors.accent};
        background: rgba(57, 255, 20, 0.1);
      `;
    }
    
    switch ($status) {
      case 'available':
        return `
          border-color: rgba(57, 255, 20, 0.3);
          ${!$canStartWindow ? 'opacity: 0.5;' : ''}
          
          &:hover {
            border-color: ${theme.colors.accent};
            background: rgba(57, 255, 20, 0.05);
          }
        `;
      case 'selected':
        return `
          border-color: ${theme.colors.accent};
          background: rgba(57, 255, 20, 0.15);
          box-shadow: 0 0 15px rgba(57, 255, 20, 0.2);
        `;
      case 'booked':
        return `
          border-color: rgba(255, 45, 149, 0.4);
          cursor: default;
        `;
      case 'yours':
        return `
          border-color: rgba(255, 45, 149, 0.6);
          background: rgba(255, 45, 149, 0.1);
        `;
      case 'in_progress':
        return `
          border-color: ${theme.colors.secondary};
          background: rgba(255, 45, 149, 0.15);
        `;
      case 'completed':
        return `
          border-color: rgba(224, 224, 224, 0.1);
          opacity: 0.5;
          cursor: default;
        `;
      default:
        return `
          border-color: rgba(224, 224, 224, 0.1);
        `;
    }
  }}
`;

const SlotTime = styled.span`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.contrast};
`;

const SlotInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const DjName = styled.span<{ $isYours?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme, $isYours }) => $isYours ? theme.colors.secondary : 'rgba(255, 45, 149, 0.9)'};
`;

const B2BBadge = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.75rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.accent};
  background: rgba(57, 255, 20, 0.15);
  border: 1px solid rgba(57, 255, 20, 0.4);
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
`;

const StatusLabel = styled.span<{ $status: string }>`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: capitalize;
  
  ${({ $status, theme }) => {
    switch ($status) {
      case 'available':
      case 'selected':
        return `color: ${theme.colors.accent};`;
      case 'yours':
        return `color: ${theme.colors.secondary};`;
      default:
        return `color: rgba(224, 224, 224, 0.5);`;
    }
  }}
`;

export interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  status: 'available' | 'booked' | 'yours' | 'in_progress' | 'completed';
  slotIndex: number;
  djName?: string;
  b2bPartner?: string;
}

interface SlotGridProps {
  slots: TimeSlot[];
  selectedSlotIds: string[];
  onSlotClick: (slotId: string) => void;
  allowConsecutive: boolean;
  maxConsecutive: number;
  currentUserId?: string;
  selectedSlotCount?: number;
}

export default function SlotGrid({
  slots,
  selectedSlotIds,
  onSlotClick,
  allowConsecutive,
  maxConsecutive,
  selectedSlotCount = 1,
}: SlotGridProps) {
  const [hoveredSlotId, setHoveredSlotId] = useState<string | null>(null);
  
  // Sort slots by index
  const sortedSlots = [...slots].sort((a, b) => a.slotIndex - b.slotIndex);
  
  // Calculate which slots can start a multi-slot window
  const getWindowSlots = (startSlotId: string): string[] => {
    const startSlot = slots.find(s => s.id === startSlotId);
    if (!startSlot || startSlot.status !== 'available') return [];
    
    const startIndex = slots.findIndex(s => s.id === startSlotId);
    const windowSlots: string[] = [startSlotId];
    
    for (let i = startIndex + 1; i < slots.length && windowSlots.length < selectedSlotCount; i++) {
      const nextSlot = slots[i];
      const prevSlot = slots[i - 1];
      const prevEndTime = new Date(prevSlot.endTime).getTime();
      const nextStartTime = new Date(nextSlot.startTime).getTime();
      
      if (nextSlot.status === 'available' && nextStartTime === prevEndTime) {
        windowSlots.push(nextSlot.id);
      } else {
        break;
      }
    }
    
    return windowSlots;
  };
  
  // Check if a slot can start a valid window
  const canStartWindow = (slotId: string): boolean => {
    if (selectedSlotCount === 1) return true;
    const windowSlots = getWindowSlots(slotId);
    return windowSlots.length === selectedSlotCount;
  };
  
  // Get slots that would be highlighted on hover
  const getHoverWindowSlots = (): Set<string> => {
    if (!hoveredSlotId || selectedSlotCount === 1) return new Set();
    const windowSlots = getWindowSlots(hoveredSlotId);
    if (windowSlots.length === selectedSlotCount) {
      return new Set(windowSlots);
    }
    return new Set();
  };
  
  const hoverWindowSlots = getHoverWindowSlots();

  // Determine if a slot can be selected based on consecutive rules
  const canSelectSlot = (slotId: string) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot || slot.status !== 'available') return false;

    // In single slot mode, any available slot can be selected (replaces current selection)
    if (selectedSlotCount === 1) {
      return true;
    }

    // If nothing selected, check if this slot can start a valid window
    if (selectedSlotIds.length === 0) {
      return canStartWindow(slotId);
    }

    // Handle SQLite integer booleans (0/1) - check explicitly for true/1
    const isConsecutiveAllowed = allowConsecutive === true || (allowConsecutive as unknown) === 1;
    
    // If consecutive not allowed, only one slot can be selected
    if (!isConsecutiveAllowed) return false;

    // Check if we've hit the max
    if (selectedSlotIds.length >= maxConsecutive) return false;

    // Find selected slot indices
    const selectedIndices = selectedSlotIds
      .map(id => slots.find(s => s.id === id)?.slotIndex)
      .filter((idx): idx is number => idx !== undefined)
      .sort((a, b) => a - b);

    const minSelected = Math.min(...selectedIndices);
    const maxSelected = Math.max(...selectedIndices);

    // Can only select if adjacent to current selection
    return slot.slotIndex === minSelected - 1 || slot.slotIndex === maxSelected + 1;
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getDisplayStatus = (slot: TimeSlot, isSelected: boolean) => {
    if (isSelected) return 'selected';
    return slot.status;
  };

  const getStatusLabel = (slot: TimeSlot, isSelected: boolean) => {
    if (isSelected) return 'Selected';
    switch (slot.status) {
      case 'available':
        return 'Open';
      case 'yours':
        return 'Your Set';
      case 'in_progress':
        return 'Live';
      case 'completed':
        return 'Done';
      default:
        return '';
    }
  };

  return (
    <ListContainer>
      {sortedSlots.map((slot) => {
        const isSelected = selectedSlotIds.includes(slot.id);
        const displayStatus = getDisplayStatus(slot, isSelected);
        const isSelectable = canSelectSlot(slot.id) || isSelected;
        const isBooked = slot.status === 'booked' || slot.status === 'yours';
        const isInHoverWindow = hoverWindowSlots.has(slot.id);
        const slotCanStartWindow = slot.status === 'available' && canStartWindow(slot.id);
        
        return (
          <SlotRow
            key={slot.id}
            $status={displayStatus}
            $isSelectable={isSelectable}
            $isInHoverWindow={isInHoverWindow}
            $canStartWindow={slotCanStartWindow}
            onClick={isSelectable ? () => onSlotClick(slot.id) : undefined}
            onMouseEnter={() => slot.status === 'available' && setHoveredSlotId(slot.id)}
            onMouseLeave={() => setHoveredSlotId(null)}
            type="button"
          >
            <SlotTime>{formatTime(slot.startTime)}</SlotTime>
            
            <SlotInfo>
              {isBooked && slot.djName && (
                <>
                  <DjName $isYours={slot.status === 'yours'}>{slot.djName}</DjName>
                  {slot.b2bPartner && (
                    <B2BBadge>+ {slot.b2bPartner}</B2BBadge>
                  )}
                </>
              )}
              {!isBooked && (
                <StatusLabel $status={displayStatus}>
                  {getStatusLabel(slot, isSelected)}
                </StatusLabel>
              )}
            </SlotInfo>
          </SlotRow>
        );
      })}
    </ListContainer>
  );
}
