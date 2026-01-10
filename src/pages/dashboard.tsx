import { useState, useEffect } from 'react';
import styled, { keyframes, ThemeProvider } from 'styled-components';
import Head from 'next/head';
import AppLayout from '@/components/layout/AppLayout';
import { useUser } from '@/contexts/UserContext';
import { theme } from '@/styles/theme';

// Splash screen animations
const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
`;

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const glitch = keyframes`
  0% {
    clip-path: inset(40% 0 61% 0);
    transform: translate(-2px, 2px);
  }
  20% {
    clip-path: inset(92% 0 1% 0);
    transform: translate(1px, -1px);
  }
  40% {
    clip-path: inset(43% 0 1% 0);
    transform: translate(-1px, 2px);
  }
  60% {
    clip-path: inset(25% 0 58% 0);
    transform: translate(2px, 1px);
  }
  80% {
    clip-path: inset(54% 0 7% 0);
    transform: translate(-2px, -1px);
  }
  100% {
    clip-path: inset(58% 0 43% 0);
    transform: translate(1px, 2px);
  }
`;

// Splash Screen Styles
const SplashContainer = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  /* Grid pattern background */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      linear-gradient(90deg, rgba(57, 255, 20, 0.03) 1px, transparent 1px),
      linear-gradient(rgba(57, 255, 20, 0.03) 1px, transparent 1px);
    background-size: 20px 20px;
    z-index: 0;
  }
  
  /* CRT scanlines */
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      rgba(18, 16, 16, 0) 50%, 
      rgba(0, 0, 0, 0.25) 50%
    );
    background-size: 100% 4px;
    z-index: 10;
    pointer-events: none;
    opacity: 0.15;
  }
`;

const SplashContent = styled.div`
  position: relative;
  z-index: 5;
  text-align: center;
  padding: 2rem;
`;

const Logo = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 2rem;
  position: relative;
`;

const LogoRing = styled.div`
  position: absolute;
  inset: 0;
  border: 3px solid ${({ theme }) => theme.colors.accent};
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${spin} 1.5s linear infinite;
  box-shadow: 0 0 20px rgba(57, 255, 20, 0.3);
`;

const LogoInner = styled.div`
  position: absolute;
  inset: 12px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.accent}, ${({ theme }) => theme.colors.secondary});
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${pulse} 2s ease-in-out infinite;
  box-shadow: 0 0 30px rgba(57, 255, 20, 0.4);
  
  svg {
    width: 28px;
    height: 28px;
    color: ${({ theme }) => theme.colors.background};
  }
`;

const SplashTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.75rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 3px;
  margin: 0 0 0.5rem;
  background: linear-gradient(90deg, ${({ theme }) => theme.colors.accent}, ${({ theme }) => theme.colors.secondary});
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  position: relative;
  
  &::after {
    content: "DJ TAP-IN";
    position: absolute;
    left: 2px;
    top: 0;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.secondary}, ${({ theme }) => theme.colors.accent});
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: ${glitch} 3s infinite linear alternate-reverse;
    opacity: 0.5;
  }
`;

const SplashSubtitle = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.85rem;
  color: rgba(224, 224, 224, 0.6);
  margin: 0 0 2rem;
`;

const LoadingText = styled.p<{ $visible: boolean }>`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.accent};
  text-transform: uppercase;
  letter-spacing: 2px;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.3s ease;
`;

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

const CreateAccountButton = styled.button`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  padding: 1rem 2rem;
  margin-top: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  background: linear-gradient(
    90deg, 
    ${({ theme }) => theme.colors.secondary}, 
    ${({ theme }) => theme.colors.accent},
    ${({ theme }) => theme.colors.secondary}
  );
  background-size: 200% auto;
  color: ${({ theme }) => theme.colors.background};
  box-shadow: 0 4px 20px rgba(255, 45, 149, 0.4);
  transition: all 0.3s ease;
  animation: ${shimmer} 3s linear infinite;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 30px rgba(255, 45, 149, 0.6);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const WelcomeMessage = styled.div<{ $visible: boolean }>`
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: translateY(${({ $visible }) => ($visible ? '0' : '20px')});
  transition: all 0.5s ease;
  margin-top: 1rem;
`;

const WelcomeText = styled.p`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.contrast};
  margin: 0 0 0.5rem;
`;

const UserName = styled.span`
  color: ${({ theme }) => theme.colors.secondary};
  text-shadow: 0 0 10px rgba(255, 45, 149, 0.5);
`;

// Dashboard Styles
const DashboardContainer = styled.div`
  padding: 1rem;
  animation: ${fadeIn} 0.5s ease;
`;

const WelcomeHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const Greeting = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.contrast};
  margin: 0 0 0.25rem;
`;

const GreetingAccent = styled.span`
  background: linear-gradient(90deg, ${({ theme }) => theme.colors.accent}, ${({ theme }) => theme.colors.secondary});
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;

const SubGreeting = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.85rem;
  color: rgba(224, 224, 224, 0.6);
  margin: 0;
`;

const QuickActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.85rem;
  font-weight: 700;
  color: rgba(224, 224, 224, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 1rem;
`;

const ActionCard = styled.a<{ $accent?: 'green' | 'pink' }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: rgba(26, 26, 26, 0.7);
  border: 1px solid ${({ $accent }) => 
    $accent === 'pink' ? 'rgba(255, 45, 149, 0.2)' : 'rgba(57, 255, 20, 0.2)'};
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateX(4px);
    box-shadow: ${({ $accent }) => 
      $accent === 'pink' 
        ? '0 4px 20px rgba(255, 45, 149, 0.2)'
        : '0 4px 20px rgba(57, 255, 20, 0.2)'};
    border-color: ${({ $accent }) => 
      $accent === 'pink' ? 'rgba(255, 45, 149, 0.4)' : 'rgba(57, 255, 20, 0.4)'};
  }
`;

const ActionIcon = styled.div<{ $accent?: 'green' | 'pink' }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ $accent }) => 
    $accent === 'pink' 
      ? 'linear-gradient(135deg, rgba(255, 45, 149, 0.2), rgba(255, 45, 149, 0.1))'
      : 'linear-gradient(135deg, rgba(57, 255, 20, 0.2), rgba(57, 255, 20, 0.1))'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  svg {
    width: 24px;
    height: 24px;
    color: ${({ $accent, theme }) => 
      $accent === 'pink' ? theme.colors.secondary : theme.colors.accent};
  }
`;

const ActionContent = styled.div`
  flex: 1;
`;

const ActionTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.contrast};
  margin: 0 0 0.25rem;
`;

const ActionDescription = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.75rem;
  color: rgba(224, 224, 224, 0.5);
  margin: 0;
`;

const ArrowIcon = styled.div`
  color: rgba(224, 224, 224, 0.3);
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

// Icons
const MusicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const ChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9,18 15,12 9,6" />
  </svg>
);

// Debug display styled component
const DebugPanel = styled.div`
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  max-height: 40vh;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: 8px;
  padding: 12px;
  font-family: monospace;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.accent};
  z-index: 9999;
  
  pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
  }
  
  h4 {
    color: ${({ theme }) => theme.colors.secondary};
    margin: 0 0 8px 0;
    font-size: 12px;
  }
`;

export default function DashboardPage() {
  const { user, isLoading } = useUser();
  
  const [showSplash, setShowSplash] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [splashPhase, setSplashPhase] = useState<'loading' | 'welcome' | 'transitioning'>('loading');
  
  // Debug: capture SDK context
  const [sdkContext, setSdkContext] = useState<Record<string, unknown> | null>(null);
  
  useEffect(() => {
    const captureContext = async () => {
      if (typeof window === 'undefined') return;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any;
      const contextData: Record<string, unknown> = {
        timestamp: new Date().toISOString(),
        userFromContext: user,
        isLoading,
      };
      
      // Check window.farcaster.context
      if (win.farcaster?.context) {
        try {
          const ctx = await win.farcaster.context;
          contextData.farcasterContext = ctx;
        } catch (e) {
          contextData.farcasterContextError = String(e);
        }
      }
      
      // Check __renaissanceAuthContext
      if (win.__renaissanceAuthContext) {
        contextData.renaissanceAuthContext = win.__renaissanceAuthContext;
      }
      
      // Check getRenaissanceAuth
      if (typeof win.getRenaissanceAuth === 'function') {
        try {
          contextData.getRenaissanceAuth = win.getRenaissanceAuth();
        } catch (e) {
          contextData.getRenaissanceAuthError = String(e);
        }
      }
      
      // Check early detection
      if (win.__FARCASTER_USER__) {
        contextData.earlyUser = win.__FARCASTER_USER__;
      }
      
      // All relevant window keys
      contextData.windowKeys = Object.keys(win).filter((k: string) => 
        k.toLowerCase().includes('farcaster') || 
        k.toLowerCase().includes('renaissance') ||
        k.startsWith('__FARCASTER')
      );
      
      setSdkContext(contextData);
    };
    
    captureContext();
    // Re-capture every 2 seconds
    const interval = setInterval(captureContext, 2000);
    return () => clearInterval(interval);
  }, [user, isLoading]);

  useEffect(() => {
    // After auth loading completes or 2 seconds (whichever is later), show welcome
    const minLoadTime = 2000;
    const startTime = Date.now();

    const checkAuthAndTransition = () => {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadTime - elapsed);

      // Wait for minimum time
      setTimeout(() => {
        if (user) {
          // User is logged in - show welcome message then transition
          setSplashPhase('welcome');
          setShowWelcome(true);
          
          // After showing welcome, transition to dashboard
          setTimeout(() => {
            setSplashPhase('transitioning');
            setTimeout(() => {
              setShowSplash(false);
            }, 300);
          }, 1500);
        } else if (!isLoading) {
          // Not loading and no user - keep splash visible with login prompt
          // User will need to authenticate via Farcaster
          setSplashPhase('welcome');
          setShowWelcome(true);
        }
      }, remainingTime);
    };

    if (!isLoading) {
      checkAuthAndTransition();
    } else {
      // Start timer even while loading
      const timer = setTimeout(() => {
        if (user) {
          setSplashPhase('welcome');
          setShowWelcome(true);
          setTimeout(() => {
            setSplashPhase('transitioning');
            setTimeout(() => {
              setShowSplash(false);
            }, 300);
          }, 1500);
        }
      }, minLoadTime);

      return () => clearTimeout(timer);
    }
  }, [user, isLoading]);

  // Watch for user changes after initial load
  useEffect(() => {
    if (!isLoading && user && splashPhase === 'loading') {
      setSplashPhase('welcome');
      setShowWelcome(true);
      setTimeout(() => {
        setSplashPhase('transitioning');
        setTimeout(() => {
          setShowSplash(false);
        }, 300);
      }, 1500);
    }
  }, [user, isLoading, splashPhase]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Splash Screen
  if (showSplash) {
    return (
      <ThemeProvider theme={theme}>
        <Head>
          <title>DJ Tap-In Queue</title>
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <SplashContainer>
          <SplashContent>
            <Logo>
              <LogoRing />
              <LogoInner>
                <MusicIcon />
              </LogoInner>
            </Logo>
            
            <SplashTitle>DJ TAP-IN</SplashTitle>
            <SplashSubtitle>Step Up. Plug In. Run the Decks.</SplashSubtitle>
            
            <LoadingText $visible={splashPhase === 'loading'}>
              {isLoading ? 'Connecting...' : 'Loading...'}
            </LoadingText>
            
            <WelcomeMessage $visible={showWelcome}>
              {user ? (
                <>
                  <WelcomeText>
                    Welcome back, <UserName>{user.displayName || user.username || 'DJ'}</UserName>
                  </WelcomeText>
                  <LoadingText $visible>Preparing your dashboard...</LoadingText>
                </>
              ) : (
                <>
                  <WelcomeText>Welcome to the Queue</WelcomeText>
                  <CreateAccountButton>
                    Create Your Renaissance Account
                  </CreateAccountButton>
                </>
              )}
            </WelcomeMessage>
          </SplashContent>
          
          {/* Debug Panel */}
          {sdkContext && (
            <DebugPanel>
              <h4>🔍 SDK Context Debug</h4>
              <pre>{JSON.stringify(sdkContext, null, 2)}</pre>
            </DebugPanel>
          )}
        </SplashContainer>
      </ThemeProvider>
    );
  }

  // Main Dashboard
  return (
    <AppLayout title="Dashboard | DJ Tap-In Queue">
      <DashboardContainer>
        <WelcomeHeader>
          <Greeting>
            {getGreeting()}, <GreetingAccent>{user?.displayName || user?.username || 'DJ'}</GreetingAccent>
          </Greeting>
          <SubGreeting>What would you like to do?</SubGreeting>
        </WelcomeHeader>

        <QuickActions>
          <SectionTitle>Quick Actions</SectionTitle>
          
          <ActionCard href="/events" $accent="green">
            <ActionIcon $accent="green">
              <CalendarIcon />
            </ActionIcon>
            <ActionContent>
              <ActionTitle>Find Events</ActionTitle>
              <ActionDescription>Browse open decks and book your slot</ActionDescription>
            </ActionContent>
            <ArrowIcon>
              <ChevronRight />
            </ArrowIcon>
          </ActionCard>

          <ActionCard href="/bookings" $accent="pink">
            <ActionIcon $accent="pink">
              <MusicIcon />
            </ActionIcon>
            <ActionContent>
              <ActionTitle>My Sets</ActionTitle>
              <ActionDescription>View your upcoming performances</ActionDescription>
            </ActionContent>
            <ArrowIcon>
              <ChevronRight />
            </ArrowIcon>
          </ActionCard>

          <ActionCard href="/host/create" $accent="green">
            <ActionIcon $accent="green">
              <PlusIcon />
            </ActionIcon>
            <ActionContent>
              <ActionTitle>Host an Event</ActionTitle>
              <ActionDescription>Create a new open decks session</ActionDescription>
            </ActionContent>
            <ArrowIcon>
              <ChevronRight />
            </ArrowIcon>
          </ActionCard>

          <ActionCard href="/bookings" $accent="pink">
            <ActionIcon $accent="pink">
              <UsersIcon />
            </ActionIcon>
            <ActionContent>
              <ActionTitle>B2B Requests</ActionTitle>
              <ActionDescription>Manage collaboration invites</ActionDescription>
            </ActionContent>
            <ArrowIcon>
              <ChevronRight />
            </ArrowIcon>
          </ActionCard>
        </QuickActions>
        
        {/* Debug Panel */}
        {sdkContext && (
          <DebugPanel>
            <h4>🔍 SDK Context Debug</h4>
            <pre>{JSON.stringify(sdkContext, null, 2)}</pre>
          </DebugPanel>
        )}
      </DashboardContainer>
    </AppLayout>
  );
}
