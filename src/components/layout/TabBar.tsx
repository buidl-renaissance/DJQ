import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useUser } from '@/contexts/UserContext';

const ADMIN_USERNAME = 'WiredInSamurai';

const TabBarContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background-color: ${({ theme }) => theme.colors.dark};
  border-top: 1px solid rgba(57, 255, 20, 0.2);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom, 0);
  
  /* Subtle glow effect */
  box-shadow: 0 -4px 20px rgba(57, 255, 20, 0.1);
`;

interface TabItemProps {
  $isActive: boolean;
}

const TabItem = styled.a<TabItemProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  text-decoration: none;
  color: ${({ theme, $isActive }) => 
    $isActive ? theme.colors.accent : 'rgba(224, 224, 224, 0.5)'};
  transition: all 0.2s ease;
  position: relative;
  min-width: 44px;
  min-height: 44px;
  
  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }
  
  /* Active indicator */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: ${({ $isActive }) => ($isActive ? '40px' : '0')};
    height: 2px;
    background: ${({ theme }) => theme.colors.accent};
    box-shadow: ${({ $isActive, theme }) => 
      $isActive ? `0 0 10px ${theme.colors.accent}` : 'none'};
    transition: all 0.2s ease;
  }
`;

const TabIcon = styled.div`
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
`;

const TabLabel = styled.span`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

// SVG Icons as components
const EventsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const BookingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const HostIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const AccountIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const AdminIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

interface Tab {
  href: string;
  label: string;
  icon: React.ReactNode;
  matchPaths: string[];
}

const baseTabs: Tab[] = [
  {
    href: '/events',
    label: 'Events',
    icon: <EventsIcon />,
    matchPaths: ['/events'],
  },
  {
    href: '/bookings',
    label: 'My Sets',
    icon: <BookingsIcon />,
    matchPaths: ['/bookings'],
  },
  {
    href: '/host',
    label: 'Host',
    icon: <HostIcon />,
    matchPaths: ['/host'],
  },
  {
    href: '/account',
    label: 'Account',
    icon: <AccountIcon />,
    matchPaths: ['/account'],
  },
];

const adminTab: Tab = {
  href: '/admin',
  label: 'Admin',
  icon: <AdminIcon />,
  matchPaths: ['/admin'],
};

export default function TabBar() {
  const router = useRouter();
  const { user } = useUser();
  
  const isAdmin = user?.username === ADMIN_USERNAME;
  const tabs = isAdmin ? [...baseTabs, adminTab] : baseTabs;
  
  const isActive = (tab: Tab) => {
    return tab.matchPaths.some(path => router.pathname.startsWith(path));
  };
  
  return (
    <TabBarContainer>
      {tabs.map((tab) => (
        <Link key={tab.href} href={tab.href} passHref legacyBehavior>
          <TabItem $isActive={isActive(tab)}>
            <TabIcon>{tab.icon}</TabIcon>
            <TabLabel>{tab.label}</TabLabel>
          </TabItem>
        </Link>
      ))}
    </TabBarContainer>
  );
}
