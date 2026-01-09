import styled from 'styled-components';
import SlotChip, { SlotChipProps } from './SlotChip';

const GridContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
`;

const GridSection = styled.div`
  width: 100%;
  margin-bottom: 1rem;
`;

const SectionLabel = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(224, 224, 224, 0.4);
  padding: 0.5rem 0;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid rgba(224, 224, 224, 0.1);
`;

export interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  status: 'available' | 'booked' | 'yours' | 'in_progress' | 'completed';
  slotIndex: number;
  djName?: string;
}

interface SlotGridProps {
  slots: TimeSlot[];
  selectedSlotIds: string[];
  onSlotClick: (slotId: string) => void;
  allowConsecutive: boolean;
  maxConsecutive: number;
  currentUserId?: string;
}

export default function SlotGrid({
  slots,
  selectedSlotIds,
  onSlotClick,
  allowConsecutive,
  maxConsecutive,
}: SlotGridProps) {
  // Group slots by hour for better organization
  const groupedSlots = slots.reduce((acc, slot) => {
    const hour = new Date(slot.startTime).getHours();
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const key = `${displayHour} ${period}`;
    
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  // Determine if a slot can be selected based on consecutive rules
  const canSelectSlot = (slotId: string) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot || slot.status !== 'available') return false;

    // If nothing selected, any available slot can be selected
    if (selectedSlotIds.length === 0) return true;

    // If consecutive not allowed, only one slot can be selected
    if (!allowConsecutive) return false;

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

  return (
    <GridContainer>
      {Object.entries(groupedSlots).map(([hourLabel, hourSlots]) => (
        <GridSection key={hourLabel}>
          <SectionLabel>{hourLabel}</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {hourSlots.map((slot) => (
              <SlotChip
                key={slot.id}
                id={slot.id}
                startTime={slot.startTime}
                endTime={slot.endTime}
                status={slot.status}
                isSelected={selectedSlotIds.includes(slot.id)}
                onClick={() => onSlotClick(slot.id)}
                disabled={!canSelectSlot(slot.id) && !selectedSlotIds.includes(slot.id)}
                djName={slot.djName}
              />
            ))}
          </div>
        </GridSection>
      ))}
    </GridContainer>
  );
}
