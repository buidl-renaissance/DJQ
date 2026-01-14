import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import AppLayout from '@/components/layout/AppLayout';
import { useUser } from '@/contexts/UserContext';

const ADMIN_USERNAME = 'WiredInSamurai';

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
  max-width: 800px;
  margin: 0 auto;
  animation: ${fadeIn} 0.3s ease-out;
`;

const PageTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.secondary};
  text-transform: uppercase;
  letter-spacing: 3px;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const Subtitle = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.contrast};
  opacity: 0.6;
  text-align: center;
  margin-bottom: 2rem;
`;

const AccessDenied = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  padding: 2rem;
`;

const AccessDeniedTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 1rem;
`;

const AccessDeniedText = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  color: ${({ theme }) => theme.colors.contrast};
  opacity: 0.7;
`;

const LoadingText = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  color: ${({ theme }) => theme.colors.contrast};
  text-align: center;
  padding: 3rem;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  flex: 1;
  background: ${({ theme }) => theme.colors.dark};
  border: 1px solid ${({ theme }) => theme.colors.darkGray};
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
`;

const StatValue = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.accent};
`;

const StatLabel = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.contrast};
  opacity: 0.6;
  text-transform: uppercase;
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const UserCard = styled.div`
  background: ${({ theme }) => theme.colors.dark};
  border: 1px solid ${({ theme }) => theme.colors.darkGray};
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const Username = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.accent};
  margin-bottom: 0.25rem;
`;

const UserDetails = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.contrast};
  opacity: 0.7;
  
  span {
    display: inline-block;
    margin-right: 1rem;
  }
`;

const UserMeta = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.65rem;
  color: ${({ theme }) => theme.colors.contrast};
  opacity: 0.5;
  margin-top: 0.25rem;
`;

const AdminBadge = styled.span`
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.background};
  font-size: 0.6rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  margin-left: 0.5rem;
  text-transform: uppercase;
  font-family: ${({ theme }) => theme.fonts.heading};
`;

const DeleteButton = styled.button<{ $loading?: boolean }>`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.secondary};
  text-transform: uppercase;
  cursor: ${({ $loading }) => $loading ? 'wait' : 'pointer'};
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background: rgba(255, 45, 149, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const UnlockButton = styled.button<{ $loading?: boolean }>`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.accent};
  text-transform: uppercase;
  cursor: ${({ $loading }) => $loading ? 'wait' : 'pointer'};
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover:not(:disabled) {
    background: rgba(57, 255, 20, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LockedBadge = styled.span`
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.background};
  font-size: 0.6rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  margin-left: 0.5rem;
  text-transform: uppercase;
  font-family: ${({ theme }) => theme.fonts.heading};
`;

const NoPinBadge = styled.span`
  background: ${({ theme }) => theme.colors.darkGray};
  color: ${({ theme }) => theme.colors.contrast};
  font-size: 0.6rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  margin-left: 0.5rem;
  text-transform: uppercase;
  font-family: ${({ theme }) => theme.fonts.heading};
`;

const StatusBadge = styled.span<{ $status: 'active' | 'inactive' | 'banned' | null }>`
  background: ${({ theme, $status }) => 
    $status === 'banned' ? theme.colors.secondary :
    $status === 'inactive' ? theme.colors.darkGray :
    'rgba(57, 255, 20, 0.2)'};
  color: ${({ theme, $status }) => 
    $status === 'banned' ? theme.colors.background :
    $status === 'inactive' ? theme.colors.contrast :
    theme.colors.accent};
  font-size: 0.6rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  margin-left: 0.5rem;
  text-transform: uppercase;
  font-family: ${({ theme }) => theme.fonts.heading};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const StatusSelect = styled.select`
  background: ${({ theme }) => theme.colors.dark};
  border: 1px solid ${({ theme }) => theme.colors.darkGray};
  border-radius: 6px;
  padding: 0.5rem;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.contrast};
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
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

const RefreshButton = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.accent};
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1rem;
  
  &:hover {
    background: rgba(57, 255, 20, 0.1);
  }
`;

interface UserData {
  id: string;
  username: string | null;
  displayName: string | null;
  phone: string | null;
  email: string | null;
  accountAddress: string | null;
  fid: string | null;
  createdAt: string;
  bookingsCount: number;
  eventsCount: number;
  lockedAt: string | null;
  failedPinAttempts: number;
  hasPin: boolean;
  status: 'active' | 'inactive' | 'banned' | null;
}

export default function AdminPage() {
  const { user, isLoading: userLoading } = useUser();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isAdmin = user?.username === ADMIN_USERNAME;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const handleDelete = async (targetUser: UserData) => {
    const confirmMsg = `Are you sure you want to delete user "${targetUser.displayName || targetUser.username || targetUser.id}"?\n\nThis will also delete:\n- ${targetUser.bookingsCount} booking(s)\n- ${targetUser.eventsCount} event(s)\n\nThis action cannot be undone.`;
    
    if (!confirm(confirmMsg)) return;

    setDeleting(targetUser.id);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to delete user' });
        return;
      }

      setMessage({ type: 'success', text: `User "${targetUser.displayName || targetUser.username}" deleted successfully` });
      
      // Remove from list
      setUsers(prev => prev.filter(u => u.id !== targetUser.id));
    } catch (err) {
      console.error('Error deleting user:', err);
      setMessage({ type: 'error', text: 'Something went wrong' });
    } finally {
      setDeleting(null);
    }
  };

  const handleUnlock = async (targetUser: UserData) => {
    setUnlocking(targetUser.id);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unlock' }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to unlock user' });
        return;
      }

      setMessage({ type: 'success', text: `User "${targetUser.displayName || targetUser.username}" unlocked successfully` });
      
      // Update user in list
      setUsers(prev => prev.map(u => 
        u.id === targetUser.id 
          ? { ...u, lockedAt: null, failedPinAttempts: 0 }
          : u
      ));
    } catch (err) {
      console.error('Error unlocking user:', err);
      setMessage({ type: 'error', text: 'Something went wrong' });
    } finally {
      setUnlocking(null);
    }
  };

  const handleStatusChange = async (targetUser: UserData, newStatus: 'active' | 'inactive' | 'banned') => {
    if (newStatus === 'banned') {
      const confirmMsg = `Are you sure you want to BAN user "${targetUser.displayName || targetUser.username}"?\n\nThey will not be able to use the app.`;
      if (!confirm(confirmMsg)) return;
    }

    setUpdatingStatus(targetUser.id);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateStatus', status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to update status' });
        return;
      }

      setMessage({ type: 'success', text: `User status updated to "${newStatus}"` });
      
      // Update user in list
      setUsers(prev => prev.map(u => 
        u.id === targetUser.id 
          ? { ...u, status: newStatus }
          : u
      ));
    } catch (err) {
      console.error('Error updating user status:', err);
      setMessage({ type: 'error', text: 'Something went wrong' });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (userLoading) {
    return (
      <AppLayout title="Admin | DJQ">
        <Container>
          <LoadingText>Loading...</LoadingText>
        </Container>
      </AppLayout>
    );
  }

  if (!user || !isAdmin) {
    return (
      <AppLayout title="Admin | DJQ">
        <Container>
          <AccessDenied>
            <AccessDeniedTitle>Access Denied</AccessDeniedTitle>
            <AccessDeniedText>
              You do not have permission to access this page.
            </AccessDeniedText>
          </AccessDenied>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Admin | DJQ">
      <Container>
        <PageTitle>Admin Panel</PageTitle>
        <Subtitle>Manage users and data</Subtitle>

        {message && (
          <Message $type={message.type}>{message.text}</Message>
        )}

        <StatsRow>
          <StatCard>
            <StatValue>{users.length}</StatValue>
            <StatLabel>Total Users</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{users.reduce((sum, u) => sum + u.bookingsCount, 0)}</StatValue>
            <StatLabel>Total Bookings</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{users.reduce((sum, u) => sum + u.eventsCount, 0)}</StatValue>
            <StatLabel>Total Events</StatLabel>
          </StatCard>
        </StatsRow>

        <RefreshButton onClick={fetchUsers} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </RefreshButton>

        {loading ? (
          <LoadingText>Loading users...</LoadingText>
        ) : (
          <UserList>
            {users.map((u) => {
              const isUserAdmin = u.username === ADMIN_USERNAME;
              const isLocked = !!u.lockedAt;
              
              return (
                <UserCard key={u.id}>
                  <UserInfo>
                    <Username>
                      {u.displayName || u.username || 'No name'}
                      {u.username && ` (@${u.username})`}
                      {isUserAdmin && <AdminBadge>Admin</AdminBadge>}
                      {!isUserAdmin && <StatusBadge $status={u.status}>{u.status || 'active'}</StatusBadge>}
                      {isLocked && <LockedBadge>Locked</LockedBadge>}
                      {!u.hasPin && !isUserAdmin && <NoPinBadge>No PIN</NoPinBadge>}
                    </Username>
                    <UserDetails>
                      <span>📅 {u.bookingsCount} bookings</span>
                      <span>🎉 {u.eventsCount} events</span>
                      {u.phone && <span>📱 {u.phone}</span>}
                      {u.failedPinAttempts > 0 && <span>⚠️ {u.failedPinAttempts} failed attempts</span>}
                    </UserDetails>
                    <UserMeta>
                      ID: {u.id.slice(0, 8)}... • Joined {formatDate(u.createdAt)}
                      {u.fid && ` • FID: ${u.fid}`}
                      {u.accountAddress && ` • ${u.accountAddress.slice(0, 6)}...${u.accountAddress.slice(-4)}`}
                    </UserMeta>
                  </UserInfo>
                  
                  {!isUserAdmin && (
                    <ButtonGroup>
                      <StatusSelect
                        value={u.status || 'active'}
                        onChange={(e) => handleStatusChange(u, e.target.value as 'active' | 'inactive' | 'banned')}
                        disabled={updatingStatus === u.id}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="banned">Banned</option>
                      </StatusSelect>
                      {isLocked && (
                        <UnlockButton
                          onClick={() => handleUnlock(u)}
                          disabled={unlocking === u.id}
                          $loading={unlocking === u.id}
                        >
                          {unlocking === u.id ? 'Unlocking...' : 'Unlock'}
                        </UnlockButton>
                      )}
                      <DeleteButton
                        onClick={() => handleDelete(u)}
                        disabled={deleting === u.id}
                        $loading={deleting === u.id}
                      >
                        {deleting === u.id ? 'Deleting...' : 'Delete'}
                      </DeleteButton>
                    </ButtonGroup>
                  )}
                </UserCard>
              );
            })}
          </UserList>
        )}
      </Container>
    </AppLayout>
  );
}
