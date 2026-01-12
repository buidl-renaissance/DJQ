import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Cropper, { Area } from 'react-easy-crop';
import styled, { keyframes } from 'styled-components';

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
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  z-index: 9999; /* Above everything including tab bar */
  animation: ${fadeIn} 0.2s ease-out;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.darkGray};
`;

const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.accent};
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.contrast};
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  opacity: 0.7;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
`;

const CropperContainer = styled.div`
  position: relative;
  flex: 1;
  background: ${({ theme }) => theme.colors.background};
`;

const Controls = styled.div`
  padding: 1rem 1.5rem;
  padding-bottom: calc(1rem + env(safe-area-inset-bottom, 20px)); /* Account for safe area on notched devices */
  background: ${({ theme }) => theme.colors.dark};
  border-top: 1px solid ${({ theme }) => theme.colors.darkGray};
  animation: ${slideUp} 0.3s ease-out;
`;

const ZoomControl = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ZoomLabel = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.contrast};
  opacity: 0.7;
  min-width: 40px;
`;

const ZoomSlider = styled.input`
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: ${({ theme }) => theme.colors.darkGray};
  border-radius: 2px;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    background: ${({ theme }) => theme.colors.accent};
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 10px rgba(57, 255, 20, 0.3);
    transition: transform 0.2s;
    
    &:hover {
      transform: scale(1.1);
    }
  }
  
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: ${({ theme }) => theme.colors.accent};
    border-radius: 50%;
    cursor: pointer;
    border: none;
    box-shadow: 0 0 10px rgba(57, 255, 20, 0.3);
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const Button = styled.button<{ $variant: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 0.875rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  
  ${({ $variant, theme }) => $variant === 'primary' ? `
    background: ${theme.colors.accent};
    border: none;
    color: ${theme.colors.background};
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(57, 255, 20, 0.4);
    }
  ` : `
    background: transparent;
    border: 1px solid ${theme.colors.darkGray};
    color: ${theme.colors.contrast};
    
    &:hover:not(:disabled) {
      border-color: ${theme.colors.contrast};
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Helper to create cropped image
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Set canvas size to 200x200 (final output size)
  const outputSize = 200;
  canvas.width = outputSize;
  canvas.height = outputSize;

  // Draw the cropped image scaled to 200x200
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas is empty'));
        }
      },
      'image/jpeg',
      0.9
    );
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });
}

interface ImageCropModalProps {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export default function ImageCropModal({ imageSrc, onCropComplete, onCancel }: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure we only render portal on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onCropAreaChange = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    
    setProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedBlob);
    } catch (err) {
      console.error('Error cropping image:', err);
    } finally {
      setProcessing(false);
    }
  };

  const modalContent = (
    <Overlay>
      <Header>
        <Title>Crop Photo</Title>
        <CloseButton onClick={onCancel}>&times;</CloseButton>
      </Header>
      
      <CropperContainer>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropAreaChange}
        />
      </CropperContainer>
      
      <Controls>
        <ZoomControl>
          <ZoomLabel>Zoom</ZoomLabel>
          <ZoomSlider
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </ZoomControl>
        
        <ButtonRow>
          <Button $variant="secondary" onClick={onCancel} disabled={processing}>
            Cancel
          </Button>
          <Button $variant="primary" onClick={handleConfirm} disabled={processing}>
            {processing ? 'Processing...' : 'Save'}
          </Button>
        </ButtonRow>
      </Controls>
    </Overlay>
  );

  // Use portal to render directly to body, outside any container hierarchy
  if (!mounted) return null;
  
  return createPortal(modalContent, document.body);
}
