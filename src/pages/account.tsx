import { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import AppLayout from '@/components/layout/AppLayout';
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
  
  &:hover .avatar-overlay {
    opacity: 1;
  }
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

const AvatarOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s;
`;

const EditIcon = styled.div`
  width: 24px;
  height: 24px;
  color: ${({ theme }) => theme.colors.accent};
`;

const EditText = styled.span`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.6rem;
  color: ${({ theme }) => theme.colors.accent};
  text-transform: uppercase;
  letter-spacing: 1px;
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

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 2px solid ${({ theme }) => theme.colors.darkGray};
  border-top-color: ${({ theme }) => theme.colors.accent};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

// Pencil/Edit SVG icon
const PencilIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function AccountPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [displayName, setDisplayName] = useState('');
  const [currentPfpUrl, setCurrentPfpUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initialize form fields when user loads
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setCurrentPfpUrl(user.pfpUrl || null);
      setPreviewUrl(user.pfpUrl || null);
    }
  }, [user]);

  const hasNameChanges = () => {
    return displayName.trim() !== (user?.displayName || '');
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

    setUploading(true);
    setMessage(null);

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/user/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to upload image' });
        // Revert preview on error
        setPreviewUrl(currentPfpUrl);
        return;
      }

      // Update with server URL
      if (data.user?.pfpUrl) {
        setCurrentPfpUrl(data.user.pfpUrl);
        setPreviewUrl(data.user.pfpUrl);
      }
      
      setMessage({ type: 'success', text: 'Profile picture updated!' });
    } catch (err) {
      console.error('Error uploading image:', err);
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
      // Revert preview on error
      setPreviewUrl(currentPfpUrl);
    } finally {
      setUploading(false);
      // Clean up local preview URL
      URL.revokeObjectURL(localPreview);
    }
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
    if (!currentPfpUrl) return;
    
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pfpUrl: null }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to remove picture' });
        return;
      }

      setCurrentPfpUrl(null);
      setPreviewUrl(null);
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
      
      if (data.user?.displayName) {
        setDisplayName(data.user.displayName);
      }
    } catch (err) {
      console.error('Error updating name:', err);
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
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
              <AvatarOverlay className="avatar-overlay">
                <EditIcon>
                  <PencilIcon />
                </EditIcon>
                <EditText>Edit</EditText>
              </AvatarOverlay>
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
      </Container>
    </AppLayout>
  );
}
