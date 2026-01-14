import { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import AppLayout from '@/components/layout/AppLayout';
import ImageCropModal from '@/components/ImageCropModal';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/router';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Container = styled.div`
  padding: 1.5rem;
  max-width: 500px;
  margin: 0 auto;
  animation: ${fadeIn} 0.3s ease-out;
`;

const PageTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.accent};
  text-transform: uppercase;
  letter-spacing: 3px;
  margin-bottom: 2rem;
  text-align: center;
`;

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
`;

const AvatarWrapper = styled.div`
  position: relative;
  cursor: pointer;
`;

const Avatar = styled.div<{ $hasImage: boolean }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${({ theme, $hasImage }) => 
    $hasImage ? 'transparent' : theme.colors.darkGray};
  border: 2px solid ${({ theme }) => theme.colors.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(57, 255, 20, 0.2);
  transition: all 0.2s;
`;

const EditButton = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accent};
  border: 2px solid ${({ theme }) => theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(57, 255, 20, 0.4);
  }
`;

const EditIcon = styled.div`
  width: 16px;
  height: 16px;
  color: ${({ theme }) => theme.colors.background};
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarPlaceholder = styled.span`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 3rem;
  color: ${({ theme }) => theme.colors.accent};
`;

const Username = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.contrast};
  opacity: 0.7;
  margin-top: 0.75rem;
`;

const RemovePhotoButton = styled.button`
  background: transparent;
  border: none;
  padding: 0.5rem;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.secondary};
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;
  
  &:hover {
    text-decoration: underline;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.dark};
  border: 1px solid ${({ theme }) => theme.colors.darkGray};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.accent};
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;

  &:last-of-type {
    margin-bottom: 0;
  }
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

const HiddenFileInput = styled.input`
  display: none;
`;

const SaveButton = styled.button<{ $loading?: boolean }>`
  background: ${({ theme, $loading }) => $loading ? theme.colors.darkGray : theme.colors.accent};
  border: none;
  border-radius: 6px;
  padding: 0.875rem 1.5rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.background};
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: ${({ $loading }) => $loading ? 'wait' : 'pointer'};
  transition: all 0.2s;
  margin-top: 1rem;
  width: 100%;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(57, 255, 20, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Message = styled.div<{ $type: 'success' | 'error' }>`
  background: ${({ $type }) => 
    $type === 'success' 
      ? 'rgba(57, 255, 20, 0.1)' 
      : 'rgba(255, 45, 149, 0.1)'};
  border: 1px solid ${({ theme, $type }) => 
    $type === 'success' 
      ? theme.colors.accent 
      : theme.colors.secondary};
  border-radius: 6px;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  color: ${({ theme, $type }) => 
    $type === 'success' 
      ? theme.colors.accent 
      : theme.colors.secondary};
  margin-bottom: 1rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
`;

const LoadingText = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  color: ${({ theme }) => theme.colors.contrast};
  opacity: 0.7;
`;

const NotAuthenticatedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  padding: 2rem;
`;

const NotAuthenticatedText = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  color: ${({ theme }) => theme.colors.contrast};
  margin-bottom: 1.5rem;
`;

const LoginButton = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: 6px;
  padding: 0.875rem 1.5rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.accent};
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(57, 255, 20, 0.1);
    transform: translateY(-2px);
  }
`;

const PinSetupNotice = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.contrast};
  opacity: 0.8;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(57, 255, 20, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(57, 255, 20, 0.2);
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 2px solid ${({ theme }) => theme.colors.darkGray};
  border-top-color: ${({ theme }) => theme.colors.accent};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const DeactivatedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;
`;

const DeactivatedIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
`;

const DeactivatedTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.contrast};
  margin-bottom: 1rem;
`;

const DeactivatedText = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  color: ${({ theme }) => theme.colors.contrast};
  opacity: 0.7;
  margin-bottom: 2rem;
  max-width: 300px;
`;

const ReactivateButton = styled.button<{ $loading?: boolean }>`
  background: ${({ theme }) => theme.colors.accent};
  border: none;
  border-radius: 6px;
  padding: 1rem 2rem;
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

const BannedContainer = styled(DeactivatedContainer)``;

const BannedTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 1rem;
`;

const BannedText = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  color: ${({ theme }) => theme.colors.contrast};
  opacity: 0.7;
  max-width: 300px;
`;

const DangerCard = styled(Card)`
  border-color: ${({ theme }) => theme.colors.secondary};
`;

const DangerCardTitle = styled(CardTitle)`
  color: ${({ theme }) => theme.colors.secondary};
`;

const DeactivateButton = styled.button<{ $loading?: boolean }>`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: 6px;
  padding: 0.875rem 1.5rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.secondary};
  text-transform: uppercase;
  letter-spacing: 2px;
  cursor: ${({ $loading }) => $loading ? 'wait' : 'pointer'};
  transition: all 0.2s;
  width: 100%;
  
  &:hover:not(:disabled) {
    background: rgba(255, 45, 149, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const DeactivateWarning = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.contrast};
  opacity: 0.7;
  margin-bottom: 1rem;
`;

// Pencil/Edit SVG icon
const PencilIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Format phone number as user types: (XXX) XXX-XXXX or +1 (XXX) XXX-XXXX
const formatPhoneNumber = (value: string): string => {
  // Strip all non-digit characters except leading +
  const hasPlus = value.startsWith('+');
  const digits = value.replace(/\D/g, '');
  
  if (!digits) return hasPlus ? '+' : '';
  
  // Handle +1 or 1 prefix (US country code)
  let formatted = '';
  let digitIndex = 0;
  
  if (hasPlus || digits.startsWith('1')) {
    // International format: +1 (XXX) XXX-XXXX
    if (digits.startsWith('1')) {
      formatted = '+1 ';
      digitIndex = 1;
    } else {
      formatted = '+';
    }
  }
  
  const remaining = digits.slice(digitIndex);
  
  if (remaining.length === 0) return formatted.trim();
  
  // Format remaining digits as (XXX) XXX-XXXX
  if (remaining.length <= 3) {
    formatted += `(${remaining}`;
  } else if (remaining.length <= 6) {
    formatted += `(${remaining.slice(0, 3)}) ${remaining.slice(3)}`;
  } else {
    formatted += `(${remaining.slice(0, 3)}) ${remaining.slice(3, 6)}-${remaining.slice(6, 10)}`;
  }
  
  return formatted;
};

export default function AccountPage() {
  const { user, isLoading, updateUser } = useUser();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [displayName, setDisplayName] = useState('');
  const [currentProfilePicture, setCurrentProfilePicture] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  // Phone state
  const [phone, setPhone] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneMessage, setPhoneMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // PIN state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [savingPin, setSavingPin] = useState(false);
  const [pinMessage, setPinMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Account status state
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check if user has a PIN set
  const userHasPin = user?.hasPin ?? false;
  
  // Check user status
  const userStatus = user?.status ?? 'active'; // null treated as active
  const isDeactivated = userStatus === 'inactive';
  const isBanned = userStatus === 'banned';

  // Initialize form fields when user loads
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setCurrentProfilePicture(user.profilePicture || null);
      setPreviewUrl(user.profilePicture || null);
      setPhone(formatPhoneNumber(user.phone || ''));
    }
  }, [user]);

  const hasNameChanges = () => {
    return displayName.trim() !== (user?.displayName || '');
  };

  const hasPhoneChanges = () => {
    const currentPhone = (user?.phone || '').replace(/[\s\-\(\)]/g, '');
    const newPhone = phone.replace(/[\s\-\(\)]/g, '');
    return newPhone !== currentPhone;
  };

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setMessage({ type: 'error', text: 'Invalid file type. Please use JPG, PNG, GIF, or WebP.' });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setMessage({ type: 'error', text: 'File too large. Maximum size is 5MB.' });
      return;
    }

    setMessage(null);

    // Create a URL for the image and show crop modal
    const imageUrl = URL.createObjectURL(file);
    setImageToCrop(imageUrl);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    // Clean up the crop image URL
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop);
    }
    setImageToCrop(null);

    setUploading(true);

    // Show local preview immediately
    const localPreview = URL.createObjectURL(croppedBlob);
    setPreviewUrl(localPreview);

    try {
      const formData = new FormData();
      formData.append('file', croppedBlob, 'avatar.jpg');

      const res = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to upload image' });
        // Revert preview on error
        setPreviewUrl(currentProfilePicture);
        return;
      }

      // Update with server URL
      if (data.user?.profilePicture) {
        setCurrentProfilePicture(data.user.profilePicture);
        setPreviewUrl(data.user.profilePicture);
        // Update the user context so other parts of the app see the change
        updateUser({ profilePicture: data.user.profilePicture });
      }
      
      setMessage({ type: 'success', text: 'Profile picture updated!' });
    } catch (err) {
      console.error('Error uploading image:', err);
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
      // Revert preview on error
      setPreviewUrl(currentProfilePicture);
    } finally {
      setUploading(false);
      // Clean up local preview URL
      URL.revokeObjectURL(localPreview);
    }
  };

  const handleCropCancel = () => {
    // Clean up the crop image URL
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop);
    }
    setImageToCrop(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleAvatarClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemovePhoto = async () => {
    if (!currentProfilePicture) return;
    
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePicture: null }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to remove picture' });
        return;
      }

      setCurrentProfilePicture(null);
      setPreviewUrl(null);
      // Update the user context so other parts of the app see the change
      updateUser({ profilePicture: null });
      setMessage({ type: 'success', text: 'Profile picture removed!' });
    } catch (err) {
      console.error('Error removing picture:', err);
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveName = async () => {
    if (!displayName.trim()) {
      setMessage({ type: 'error', text: 'Name cannot be empty' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to update' });
        return;
      }

      setMessage({ type: 'success', text: 'Name updated successfully!' });
      
      if (data.user) {
        // Update local state
        setDisplayName(data.user.displayName || '');
        // Update the user context so other parts of the app see the change
        updateUser({ displayName: data.user.displayName });
      }
    } catch (err) {
      console.error('Error updating name:', err);
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSavePhone = async () => {
    setPhoneMessage(null);

    // Normalize phone number
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');

    // Basic validation
    if (!normalizedPhone) {
      setPhoneMessage({ type: 'error', text: 'Phone number is required' });
      return;
    }

    // Check for minimum length (at least 10 digits for US numbers)
    const digitsOnly = normalizedPhone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setPhoneMessage({ type: 'error', text: 'Please enter a valid phone number' });
      return;
    }

    setSavingPhone(true);

    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPhoneMessage({ type: 'error', text: data.error || 'Failed to update phone number' });
        return;
      }

      setPhoneMessage({ type: 'success', text: 'Phone number updated!' });
      
      // Update with formatted value from server
      if (data.user?.phone) {
        setPhone(formatPhoneNumber(data.user.phone));
        updateUser({ phone: data.user.phone });
      }
    } catch (err) {
      console.error('Error updating phone:', err);
      setPhoneMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setSavingPhone(false);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const handlePinInputChange = (setter: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits, max 4 characters
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setter(value);
  };

  const handleSetPin = async () => {
    setPinMessage(null);

    // Validate inputs
    if (newPin.length !== 4) {
      setPinMessage({ type: 'error', text: 'PIN must be 4 digits' });
      return;
    }

    if (newPin !== confirmNewPin) {
      setPinMessage({ type: 'error', text: 'PINs do not match' });
      return;
    }

    setSavingPin(true);

    try {
      const res = await fetch('/api/user/set-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: newPin }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPinMessage({ type: 'error', text: data.error || 'Failed to set PIN' });
        return;
      }

      setPinMessage({ type: 'success', text: 'PIN set successfully! You can now log in on the web.' });
      
      // Clear form and refresh user to update hasPin
      setNewPin('');
      setConfirmNewPin('');
      
      // Update user context to reflect hasPin change
      updateUser({ hasPin: true });
    } catch (err) {
      console.error('Error setting PIN:', err);
      setPinMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setSavingPin(false);
    }
  };

  const handleChangePin = async () => {
    setPinMessage(null);

    // Validate inputs
    if (currentPin.length !== 4) {
      setPinMessage({ type: 'error', text: 'Current PIN must be 4 digits' });
      return;
    }

    if (newPin.length !== 4) {
      setPinMessage({ type: 'error', text: 'New PIN must be 4 digits' });
      return;
    }

    if (newPin !== confirmNewPin) {
      setPinMessage({ type: 'error', text: 'New PINs do not match' });
      return;
    }

    setSavingPin(true);

    try {
      const res = await fetch('/api/user/update-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPin, newPin }),
      });

      const data = await res.json();

      if (res.status === 423) {
        // Account locked - redirect to login
        setPinMessage({ type: 'error', text: 'Account locked. Redirecting to login...' });
        setTimeout(() => {
          router.push('/login');
        }, 2000);
        return;
      }

      if (!res.ok) {
        setPinMessage({ type: 'error', text: data.error || 'Failed to update PIN' });
        return;
      }

      setPinMessage({ type: 'success', text: 'PIN updated successfully!' });
      
      // Clear form
      setCurrentPin('');
      setNewPin('');
      setConfirmNewPin('');
    } catch (err) {
      console.error('Error updating PIN:', err);
      setPinMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setSavingPin(false);
    }
  };

  const canSubmitSetPin = newPin.length === 4 && confirmNewPin.length === 4 && newPin === confirmNewPin;
  const canSubmitPinChange = currentPin.length === 4 && newPin.length === 4 && confirmNewPin.length === 4 && newPin === confirmNewPin;

  const handleDeactivateAccount = async () => {
    const confirmMsg = 'Are you sure you want to deactivate your account?\n\nYou will no longer appear in searches and your bookings will be hidden.\n\nYou can reactivate your account at any time.';
    if (!confirm(confirmMsg)) return;

    setUpdatingStatus(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/user/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deactivate' }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to deactivate account' });
        return;
      }

      // Update user context
      updateUser({ status: 'inactive' });
      setStatusMessage({ type: 'success', text: 'Account deactivated' });
    } catch (err) {
      console.error('Error deactivating account:', err);
      setStatusMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleReactivateAccount = async () => {
    setUpdatingStatus(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/user/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reactivate' }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to reactivate account' });
        return;
      }

      // Update user context
      updateUser({ status: 'active' });
      setStatusMessage({ type: 'success', text: 'Account reactivated!' });
    } catch (err) {
      console.error('Error reactivating account:', err);
      setStatusMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Account | DJQ">
        <Container>
          <LoadingContainer>
            <LoadingText>Loading...</LoadingText>
          </LoadingContainer>
        </Container>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout title="Account | DJQ">
        <Container>
          <NotAuthenticatedContainer>
            <PageTitle>Account</PageTitle>
            <NotAuthenticatedText>
              Please log in to view your account settings.
            </NotAuthenticatedText>
            <LoginButton onClick={() => router.push('/login?redirect=/account')}>
              Log In
            </LoginButton>
          </NotAuthenticatedContainer>
        </Container>
      </AppLayout>
    );
  }

  // Show banned state
  if (isBanned) {
    return (
      <AppLayout title="Account | DJQ">
        <Container>
          <BannedContainer>
            <DeactivatedIcon>🚫</DeactivatedIcon>
            <BannedTitle>Account Banned</BannedTitle>
            <BannedText>
              Your account has been banned. If you believe this is a mistake, please contact support.
            </BannedText>
          </BannedContainer>
        </Container>
      </AppLayout>
    );
  }

  // Show deactivated state
  if (isDeactivated) {
    return (
      <AppLayout title="Account | DJQ">
        <Container>
          <DeactivatedContainer>
            <DeactivatedIcon>😴</DeactivatedIcon>
            <DeactivatedTitle>Account Deactivated</DeactivatedTitle>
            <DeactivatedText>
              Your account is currently deactivated. You won&apos;t appear in searches and your profile is hidden.
            </DeactivatedText>
            {statusMessage && (
              <Message $type={statusMessage.type}>{statusMessage.text}</Message>
            )}
            <ReactivateButton
              onClick={handleReactivateAccount}
              disabled={updatingStatus}
              $loading={updatingStatus}
            >
              {updatingStatus ? 'Reactivating...' : 'Reactivate Account'}
            </ReactivateButton>
          </DeactivatedContainer>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Account | DJQ">
      <Container>
        <PageTitle>Account</PageTitle>

        <ProfileSection>
          <AvatarWrapper onClick={handleAvatarClick}>
            <Avatar $hasImage={!!previewUrl}>
              {uploading ? (
                <Spinner />
              ) : previewUrl ? (
                <AvatarImage src={previewUrl} alt={displayName || 'Profile'} />
              ) : (
                <AvatarPlaceholder>{getInitials(displayName)}</AvatarPlaceholder>
              )}
            </Avatar>
            {!uploading && (
              <EditButton>
                <EditIcon>
                  <PencilIcon />
                </EditIcon>
              </EditButton>
            )}
          </AvatarWrapper>
          
          {user.username && <Username>@{user.username}</Username>}
          
          {previewUrl && (
            <RemovePhotoButton 
              onClick={handleRemovePhoto} 
              disabled={saving || uploading}
            >
              Remove profile picture
            </RemovePhotoButton>
          )}
        </ProfileSection>

        <HiddenFileInput
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileInputChange}
        />

        {message && (
          <Message $type={message.type}>{message.text}</Message>
        )}

        <Card>
          <CardTitle>Display Name</CardTitle>
          
          <FormGroup>
            <Input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              maxLength={100}
            />
          </FormGroup>

          <SaveButton 
            onClick={handleSaveName} 
            disabled={saving || uploading || !hasNameChanges() || !displayName.trim()}
            $loading={saving}
          >
            {saving ? 'Saving...' : 'Save Name'}
          </SaveButton>
        </Card>

        <Card>
          <CardTitle>Phone Number</CardTitle>
          
          {phoneMessage && (
            <Message $type={phoneMessage.type}>{phoneMessage.text}</Message>
          )}
          
          <FormGroup>
            <Input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="+1 (555) 123-4567"
              autoComplete="tel"
            />
          </FormGroup>

          <SaveButton 
            onClick={handleSavePhone} 
            disabled={savingPhone || !hasPhoneChanges() || !phone.trim()}
            $loading={savingPhone}
          >
            {savingPhone ? 'Saving...' : 'Save Phone'}
          </SaveButton>
        </Card>

        <Card>
          <CardTitle>{userHasPin ? 'Change PIN' : 'Set Up PIN'}</CardTitle>
          
          {!userHasPin && (
            <PinSetupNotice>
              Set up a 4-digit PIN to enable web login for your account.
            </PinSetupNotice>
          )}
          
          {pinMessage && (
            <Message $type={pinMessage.type}>{pinMessage.text}</Message>
          )}
          
          {userHasPin && (
            <FormGroup>
              <Input
                type="text"
                inputMode="numeric"
                value={currentPin}
                onChange={handlePinInputChange(setCurrentPin)}
                placeholder="Current PIN"
                maxLength={4}
                autoComplete="off"
              />
            </FormGroup>
          )}

          <FormGroup>
            <Input
              type="text"
              inputMode="numeric"
              value={newPin}
              onChange={handlePinInputChange(setNewPin)}
              placeholder={userHasPin ? 'New PIN' : 'Create PIN'}
              maxLength={4}
              autoComplete="off"
            />
          </FormGroup>

          <FormGroup>
            <Input
              type="text"
              inputMode="numeric"
              value={confirmNewPin}
              onChange={handlePinInputChange(setConfirmNewPin)}
              placeholder="Confirm PIN"
              maxLength={4}
              autoComplete="off"
            />
          </FormGroup>

          <SaveButton 
            onClick={userHasPin ? handleChangePin : handleSetPin} 
            disabled={savingPin || (userHasPin ? !canSubmitPinChange : !canSubmitSetPin)}
            $loading={savingPin}
          >
            {savingPin ? (userHasPin ? 'Updating...' : 'Setting...') : (userHasPin ? 'Update PIN' : 'Set PIN')}
          </SaveButton>
        </Card>

        <DangerCard>
          <DangerCardTitle>Deactivate Account</DangerCardTitle>
          
          {statusMessage && (
            <Message $type={statusMessage.type}>{statusMessage.text}</Message>
          )}
          
          <DeactivateWarning>
            Deactivating your account will hide your profile from searches and other users. 
            Your data will be preserved and you can reactivate at any time.
          </DeactivateWarning>
          
          <DeactivateButton
            onClick={handleDeactivateAccount}
            disabled={updatingStatus}
            $loading={updatingStatus}
          >
            {updatingStatus ? 'Deactivating...' : 'Deactivate Account'}
          </DeactivateButton>
        </DangerCard>

        {imageToCrop && (
          <ImageCropModal
            imageSrc={imageToCrop}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
          />
        )}
      </Container>
    </AppLayout>
  );
}
