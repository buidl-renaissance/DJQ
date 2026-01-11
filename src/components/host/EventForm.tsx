import { useState, useEffect } from 'react';
import styled from 'styled-components';
import DurationPicker from './DurationPicker';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(224, 224, 224, 0.7);
`;

const Input = styled.input`
  padding: 0.875rem 1rem;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 16px;
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(57, 255, 20, 0.2);
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.contrast};
  
  &::placeholder {
    color: rgba(224, 224, 224, 0.3);
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 10px rgba(57, 255, 20, 0.2);
  }
`;

const TextArea = styled.textarea`
  padding: 0.875rem 1rem;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 16px;
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(57, 255, 20, 0.2);
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.contrast};
  min-height: 80px;
  resize: vertical;
  
  &::placeholder {
    color: rgba(224, 224, 224, 0.3);
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 10px rgba(57, 255, 20, 0.2);
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const Toggle = styled.button<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.875rem 1rem;
  background-color: ${({ $isActive }) => 
    $isActive ? 'rgba(57, 255, 20, 0.1)' : 'rgba(0, 0, 0, 0.2)'};
  border: 1px solid ${({ $isActive }) => 
    $isActive ? 'rgba(57, 255, 20, 0.3)' : 'rgba(224, 224, 224, 0.1)'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const ToggleLabel = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.contrast};
`;

const ToggleSwitch = styled.div<{ $isActive: boolean }>`
  width: 44px;
  height: 24px;
  background-color: ${({ $isActive, theme }) => 
    $isActive ? theme.colors.accent : 'rgba(224, 224, 224, 0.2)'};
  border-radius: 12px;
  position: relative;
  transition: all 0.2s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ $isActive }) => ($isActive ? '22px' : '2px')};
    width: 20px;
    height: 20px;
    background-color: ${({ theme }) => theme.colors.background};
    border-radius: 50%;
    transition: all 0.2s ease;
  }
`;

const NumberInput = styled.input`
  width: 80px;
  padding: 0.5rem;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.95rem;
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(57, 255, 20, 0.2);
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.contrast};
  text-align: center;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const SlotsPreview = styled.div`
  background-color: rgba(57, 255, 20, 0.1);
  border: 1px solid rgba(57, 255, 20, 0.2);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
`;

const SlotsCount = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.accent};
  text-shadow: 0 0 15px rgba(57, 255, 20, 0.5);
`;

const SlotsLabel = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.75rem;
  color: rgba(224, 224, 224, 0.6);
  text-transform: uppercase;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const Button = styled.button<{ $variant: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 1rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ $variant, theme }) => $variant === 'primary' ? `
    background: linear-gradient(135deg, ${theme.colors.accent}, #2dd84a);
    color: ${theme.colors.background};
    border: none;
    
    &:hover:not(:disabled) {
      box-shadow: 0 4px 15px rgba(57, 255, 20, 0.4);
    }
  ` : `
    background-color: transparent;
    color: rgba(224, 224, 224, 0.7);
    border: 1px solid rgba(224, 224, 224, 0.2);
    
    &:hover:not(:disabled) {
      background-color: rgba(224, 224, 224, 0.05);
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export interface EventFormData {
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: 20 | 30 | 60;
  allowConsecutiveSlots: boolean;
  maxConsecutiveSlots: number;
  allowB2B: boolean;
}

interface EventFormProps {
  initialData?: Partial<EventFormData>;
  onSubmit: (data: EventFormData, publish: boolean) => void;
  loading?: boolean;
  isEdit?: boolean;
}

export default function EventForm({
  initialData,
  onSubmit,
  loading,
  isEdit,
}: EventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    eventDate: initialData?.eventDate || '',
    startTime: initialData?.startTime || '',
    endTime: initialData?.endTime || '',
    slotDurationMinutes: initialData?.slotDurationMinutes || 60,
    allowConsecutiveSlots: initialData?.allowConsecutiveSlots || false,
    maxConsecutiveSlots: initialData?.maxConsecutiveSlots || 2,
    allowB2B: initialData?.allowB2B ?? true,
  });

  const [slotsCount, setSlotsCount] = useState(0);

  useEffect(() => {
    if (formData.startTime && formData.endTime && formData.eventDate) {
      const start = new Date(`${formData.eventDate}T${formData.startTime}`);
      const end = new Date(`${formData.eventDate}T${formData.endTime}`);
      const durationMs = end.getTime() - start.getTime();
      const slotDurationMs = formData.slotDurationMinutes * 60 * 1000;
      
      if (durationMs > 0) {
        setSlotsCount(Math.floor(durationMs / slotDurationMs));
      } else {
        setSlotsCount(0);
      }
    } else {
      setSlotsCount(0);
    }
  }, [formData.startTime, formData.endTime, formData.eventDate, formData.slotDurationMinutes]);

  const handleChange = (field: keyof EventFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (publish: boolean) => (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, publish);
  };

  const isValid = formData.title && formData.eventDate && formData.startTime && formData.endTime && slotsCount > 0;

  return (
    <Form>
      <FormGroup>
        <Label>Event Title *</Label>
        <Input
          type="text"
          placeholder="e.g., Friday Night Open Decks"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          required
        />
      </FormGroup>

      <FormGroup>
        <Label>Description</Label>
        <TextArea
          placeholder="Tell DJs what to expect..."
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </FormGroup>

      <FormGroup>
        <Label>Event Date *</Label>
        <Input
          type="date"
          value={formData.eventDate}
          onChange={(e) => handleChange('eventDate', e.target.value)}
          required
        />
      </FormGroup>

      <Row>
        <FormGroup>
          <Label>Start Time *</Label>
          <Input
            type="time"
            value={formData.startTime}
            onChange={(e) => handleChange('startTime', e.target.value)}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label>End Time *</Label>
          <Input
            type="time"
            value={formData.endTime}
            onChange={(e) => handleChange('endTime', e.target.value)}
            required
          />
        </FormGroup>
      </Row>

      <FormGroup>
        <Label>Set Duration</Label>
        <DurationPicker
          value={formData.slotDurationMinutes}
          onChange={(value) => handleChange('slotDurationMinutes', value)}
        />
      </FormGroup>

      <FormGroup>
        <Toggle
          type="button"
          $isActive={formData.allowConsecutiveSlots}
          onClick={() => handleChange('allowConsecutiveSlots', !formData.allowConsecutiveSlots)}
        >
          <ToggleLabel>Allow Multiple Consecutive Slots</ToggleLabel>
          <ToggleSwitch $isActive={formData.allowConsecutiveSlots} />
        </Toggle>
        
        {formData.allowConsecutiveSlots && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'rgba(224, 224, 224, 0.6)' }}>Max slots:</span>
            <NumberInput
              type="number"
              min="2"
              max="5"
              value={formData.maxConsecutiveSlots}
              onChange={(e) => handleChange('maxConsecutiveSlots', parseInt(e.target.value) || 2)}
            />
          </div>
        )}
      </FormGroup>

      <FormGroup>
        <Toggle
          type="button"
          $isActive={formData.allowB2B}
          onClick={() => handleChange('allowB2B', !formData.allowB2B)}
        >
          <ToggleLabel>Allow B2B Sets</ToggleLabel>
          <ToggleSwitch $isActive={formData.allowB2B} />
        </Toggle>
      </FormGroup>

      <SlotsPreview>
        <SlotsCount>{slotsCount}</SlotsCount>
        <SlotsLabel>slots will be created</SlotsLabel>
      </SlotsPreview>

      <ButtonRow>
        <Button
          type="button"
          $variant="secondary"
          onClick={handleSubmit(false)}
          disabled={loading || !isValid}
        >
          {loading ? 'Saving...' : 'Save Draft'}
        </Button>
        <Button
          type="button"
          $variant="primary"
          onClick={handleSubmit(true)}
          disabled={loading || !isValid}
        >
          {loading ? 'Publishing...' : isEdit ? 'Update & Publish' : 'Publish'}
        </Button>
      </ButtonRow>
    </Form>
  );
}
