import { useState, useEffect } from 'react';
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

const Avatar = styled.div<{ $hasImage: boolean }>`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${({ theme, $hasImage }) => 
    $hasImage ? 'transparent' : theme.colors.darkGray};
  border: 2px solid ${({ theme }) => theme.colors.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(57, 255, 20, 0.2);
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarPlaceholder = styled.span`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.accent};
`;

const Username = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.contrast};
  opacity: 0.7;
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

const Label = styled.label`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.65rem;
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

const AvatarPreviewContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.75rem;
`;

const AvatarPreview = styled.div<{ $hasImage: boolean }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${({ theme, $hasImage }) => 
    $hasImage ? 'transparent' : theme.colors.darkGray};
  border: 2px solid ${({ theme }) => theme.colors.darkGray};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
`;

const AvatarPreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarPreviewPlaceholder = styled.span`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.contrast};
  opacity: 0.5;
`;

const PreviewLabel = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.contrast};
  opacity: 0.6;
`;

const ClearButton = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.secondary};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 45, 149, 0.1);
  }
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

const HelperText = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.contrast};
  opacity: 0.5;
  margin-top: 0.25rem;
`;

export default function AccountPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [pfpUrl, setPfpUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initialize form fields when user loads
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPfpUrl(user.pfpUrl || '');
      setPreviewUrl(user.pfpUrl || null);
    }
  }, [user]);

  // Update preview when URL changes (with debounce)
  useEffect(() => {
    const trimmedUrl = pfpUrl.trim();
    if (!trimmedUrl) {
      setPreviewUrl(null);
      return;
    }

    // Basic URL validation for preview
    try {
      const url = new URL(trimmedUrl);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        setPreviewUrl(trimmedUrl);
      } else {
        setPreviewUrl(null);
      }
    } catch {
      setPreviewUrl(null);
    }
  }, [pfpUrl]);

  const hasChanges = () => {
    const nameChanged = displayName.trim() !== (user?.displayName || '');
    const pfpChanged = pfpUrl.trim() !== (user?.pfpUrl || '');
    return nameChanged || pfpChanged;
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      setMessage({ type: 'error', text: 'Name cannot be empty' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const updateData: { displayName?: string; pfpUrl?: string | null } = {};
      
      // Only include fields that changed
      if (displayName.trim() !== (user?.displayName || '')) {
        updateData.displayName = displayName.trim();
      }
      
      const trimmedPfpUrl = pfpUrl.trim();
      if (trimmedPfpUrl !== (user?.pfpUrl || '')) {
        updateData.pfpUrl = trimmedPfpUrl || null;
      }

      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to update' });
        return;
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Update form fields from server response
      if (data.user) {
        setDisplayName(data.user.displayName || '');
        setPfpUrl(data.user.pfpUrl || '');
        setPreviewUrl(data.user.pfpUrl || null);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleClearPfp = () => {
    setPfpUrl('');
    setPreviewUrl(null);
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
          <Avatar $hasImage={!!previewUrl}>
            {previewUrl ? (
              <AvatarImage src={previewUrl} alt={displayName || 'Profile'} />
            ) : (
              <AvatarPlaceholder>{getInitials(displayName)}</AvatarPlaceholder>
            )}
          </Avatar>
          {user.username && <Username>@{user.username}</Username>}
        </ProfileSection>

        {message && (
          <Message $type={message.type}>{message.text}</Message>
        )}

        <Card>
          <CardTitle>Profile</CardTitle>
          
          <FormGroup>
            <Label>Display Name</Label>
            <Input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              maxLength={100}
            />
          </FormGroup>

          <FormGroup>
            <Label>Profile Picture URL</Label>
            <Input
              type="url"
              value={pfpUrl}
              onChange={(e) => setPfpUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <HelperText>Enter a URL to an image (JPG, PNG, GIF, WebP)</HelperText>
            
            {(previewUrl || pfpUrl) && (
              <AvatarPreviewContainer>
                <AvatarPreview $hasImage={!!previewUrl}>
                  {previewUrl ? (
                    <AvatarPreviewImage 
                      src={previewUrl} 
                      alt="Preview"
                      onError={() => setPreviewUrl(null)}
                    />
                  ) : (
                    <AvatarPreviewPlaceholder>?</AvatarPreviewPlaceholder>
                  )}
                </AvatarPreview>
                <PreviewLabel>{previewUrl ? 'Preview' : 'Invalid URL'}</PreviewLabel>
                {pfpUrl && (
                  <ClearButton onClick={handleClearPfp}>
                    Clear
                  </ClearButton>
                )}
              </AvatarPreviewContainer>
            )}
          </FormGroup>

          <SaveButton 
            onClick={handleSave} 
            disabled={saving || !hasChanges() || !displayName.trim()}
            $loading={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </SaveButton>
        </Card>
      </Container>
    </AppLayout>
  );
}
