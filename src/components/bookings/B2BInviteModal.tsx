import { useState } from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 200;
  animation: fadeIn 0.2s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Modal = styled.div`
  background-color: ${({ theme }) => theme.colors.dark};
  border: 1px solid rgba(57, 255, 20, 0.2);
  border-radius: 16px 16px 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 70vh;
  overflow: hidden;
  animation: slideUp 0.3s ease;
  
  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(224, 224, 224, 0.1);
`;

const ModalTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.contrast};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(224, 224, 224, 0.5);
  cursor: pointer;
  padding: 0.5rem;
  
  &:hover {
    color: ${({ theme }) => theme.colors.contrast};
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const ModalBody = styled.div`
  padding: 1rem;
  overflow-y: auto;
  max-height: calc(70vh - 120px);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.9rem;
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(57, 255, 20, 0.2);
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.contrast};
  margin-bottom: 1rem;
  
  &::placeholder {
    color: rgba(224, 224, 224, 0.4);
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 10px rgba(57, 255, 20, 0.2);
  }
`;

const UserList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const UserItem = styled.button<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: ${({ $isSelected }) => 
    $isSelected ? 'rgba(57, 255, 20, 0.15)' : 'rgba(0, 0, 0, 0.2)'};
  border: 1px solid ${({ $isSelected, theme }) => 
    $isSelected ? theme.colors.accent : 'transparent'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
  
  &:hover {
    background-color: ${({ $isSelected }) => 
      $isSelected ? 'rgba(57, 255, 20, 0.2)' : 'rgba(0, 0, 0, 0.3)'};
  }
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent}, ${({ theme }) => theme.colors.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.background};
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.contrast};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserUsername = styled.div`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.75rem;
  color: rgba(224, 224, 224, 0.5);
`;

const ModalFooter = styled.div`
  padding: 1rem;
  border-top: 1px solid rgba(224, 224, 224, 0.1);
`;

const SendButton = styled.button`
  width: 100%;
  padding: 1rem;
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent}, #2dd84a);
  color: ${({ theme }) => theme.colors.background};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    box-shadow: 0 4px 15px rgba(57, 255, 20, 0.3);
  }
  
  &:disabled {
    background: rgba(224, 224, 224, 0.2);
    color: rgba(224, 224, 224, 0.4);
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: rgba(224, 224, 224, 0.5);
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.85rem;
`;

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

interface User {
  id: string;
  displayName: string;
  username: string;
}

interface B2BInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (userId: string) => void;
  loading?: boolean;
  users: User[];
}

export default function B2BInviteModal({
  isOpen,
  onClose,
  onSend,
  loading,
  users,
}: B2BInviteModalProps) {
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredUsers = users.filter(
    (user) =>
      user.displayName.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSend = () => {
    if (selectedUserId) {
      onSend(selectedUserId);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Invite B2B Partner</ModalTitle>
          <CloseButton onClick={onClose}>
            <CloseIcon />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <SearchInput
            type="text"
            placeholder="Search by name or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />

          {filteredUsers.length === 0 ? (
            <EmptyState>
              {search ? 'No users found' : 'Start typing to search for DJs'}
            </EmptyState>
          ) : (
            <UserList>
              {filteredUsers.map((user) => (
                <UserItem
                  key={user.id}
                  $isSelected={selectedUserId === user.id}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <UserAvatar>{getInitials(user.displayName)}</UserAvatar>
                  <UserInfo>
                    <UserName>{user.displayName}</UserName>
                    <UserUsername>@{user.username}</UserUsername>
                  </UserInfo>
                </UserItem>
              ))}
            </UserList>
          )}
        </ModalBody>

        <ModalFooter>
          <SendButton onClick={handleSend} disabled={!selectedUserId || loading}>
            {loading ? 'Sending...' : 'Send Invite'}
          </SendButton>
        </ModalFooter>
      </Modal>
    </Overlay>
  );
}
