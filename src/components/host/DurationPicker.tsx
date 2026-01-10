import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Option = styled.button<{ $isSelected: boolean }>`
  flex: 1;
  padding: 0.75rem 0.5rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.85rem;
  font-weight: 700;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  background-color: ${({ $isSelected }) => 
    $isSelected ? 'rgba(57, 255, 20, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
  border: 2px solid ${({ $isSelected, theme }) => 
    $isSelected ? theme.colors.accent : 'rgba(224, 224, 224, 0.1)'};
  color: ${({ $isSelected, theme }) => 
    $isSelected ? theme.colors.accent : 'rgba(224, 224, 224, 0.6)'};
  
  ${({ $isSelected }) => $isSelected && `
    box-shadow: 0 0 15px rgba(57, 255, 20, 0.2);
  `}
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const Duration = styled.span`
  display: block;
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
`;

const Label = styled.span`
  display: block;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.7;
`;

interface DurationPickerProps {
  value: 20 | 30 | 60;
  onChange: (value: 20 | 30 | 60) => void;
}

const options: { value: 20 | 30 | 60; label: string }[] = [
  { value: 20, label: 'min' },
  { value: 30, label: 'min' },
  { value: 60, label: 'hr' },
];

export default function DurationPicker({ value, onChange }: DurationPickerProps) {
  return (
    <Container>
      {options.map((option) => (
        <Option
          key={option.value}
          type="button"
          $isSelected={value === option.value}
          onClick={() => onChange(option.value)}
        >
          <Duration>{option.value === 60 ? '1' : option.value}</Duration>
          <Label>{option.label}</Label>
        </Option>
      ))}
    </Container>
  );
}
