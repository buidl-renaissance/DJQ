import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useRouter } from 'next/router';
import { User } from '@/db/user';

interface SplashProps {
  user?: User | null;
  isLoading?: boolean;
  redirectDelay?: number;
}

const glitch = keyframes`
  0% {
    clip-path: inset(30% 0 40% 0);
  }
  20% {
    clip-path: inset(80% 0 1% 0);
  }
  40% {
    clip-path: inset(43% 0 27% 0);
  }
  60% {
    clip-path: inset(25% 0 58% 0);
  }
  80% {
    clip-path: inset(13% 0 75% 0);
  }
  100% {
    clip-path: inset(0% 0 100% 0);
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

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    text-shadow: 0 0 10px rgba(57, 255, 20, 0.5);
  }
  50% {
    opacity: 0.7;
    text-shadow: 0 0 20px rgba(57, 255, 20, 0.8);
  }
`;

const progressAnimation = keyframes`
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
`;

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const SplashContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
  z-index: 9999;
  gap: 2rem;
  
  /* Grid overlay */
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
    pointer-events: none;
  }
  
  /* CRT scanline effect */
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
    pointer-events: none;
    opacity: 0.15;
  }
`;

const LogoContainer = styled.div`
  animation: ${scaleIn} 0.6s ease-out;
  position: relative;
  z-index: 1;
`;

const Logo = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: 900;
  font-size: 4rem;
  margin: 0;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 4px;
  position: relative;
  color: transparent;
  
  &::before, &::after {
    content: "DJ Tap-In";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.accent}, ${({ theme }) => theme.colors.secondary});
    -webkit-background-clip: text;
    background-clip: text;
  }
  
  &::before {
    left: 2px;
    text-shadow: -2px 0 ${({ theme }) => theme.colors.secondary};
    animation: ${glitch} 2s infinite linear alternate-reverse;
  }
  
  &::after {
    left: -2px;
    text-shadow: 2px 0 ${({ theme }) => theme.colors.accent};
    animation: ${glitch} 3s infinite linear alternate-reverse;
  }
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
    letter-spacing: 2px;
  }
`;

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  animation: ${fadeIn} 0.6s ease-out 0.3s both;
  position: relative;
  z-index: 1;
`;

const ProfileImageContainer = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid ${({ theme }) => theme.colors.accent};
  background: ${({ theme }) => theme.colors.dark};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 0 20px rgba(57, 255, 20, 0.5),
    inset 0 0 20px rgba(57, 255, 20, 0.1);
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const DefaultAvatar = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.dark} 0%, ${({ theme }) => theme.colors.darkGray} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.accent};
  font-size: 2.5rem;
  font-weight: bold;
  font-family: ${({ theme }) => theme.fonts.heading};
  text-shadow: 0 0 10px rgba(57, 255, 20, 0.8);
`;

const LoadingSpinner = styled.div`
  width: 100px;
  height: 100px;
  background-color: ${({ theme }) => theme.colors.dark};
  border: 3px solid ${({ theme }) => theme.colors.darkGray};
  border-top-color: ${({ theme }) => theme.colors.accent};
  border-right-color: ${({ theme }) => theme.colors.secondary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  box-shadow: 
    0 0 20px rgba(57, 255, 20, 0.3),
    inset 0 0 20px rgba(255, 45, 149, 0.1);
`;

const WelcomeText = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.6rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.contrast};
  margin: 0;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2px;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const SubText = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.accent};
  margin: 0;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const ProgressContainer = styled.div`
  width: 200px;
  height: 4px;
  background: ${({ theme }) => theme.colors.darkGray};
  border-radius: 2px;
  overflow: hidden;
  animation: ${fadeIn} 0.6s ease-out 0.6s both;
  position: relative;
  z-index: 1;
  box-shadow: 0 0 10px rgba(255, 45, 149, 0.3);
`;

const ProgressBar = styled.div<{ duration: number }>`
  height: 100%;
  background: linear-gradient(90deg, ${({ theme }) => theme.colors.accent}, ${({ theme }) => theme.colors.secondary});
  border-radius: 2px;
  animation: ${progressAnimation} ${({ duration }) => duration}ms linear forwards;
  box-shadow: 0 0 10px rgba(57, 255, 20, 0.8);
`;

const Splash: React.FC<SplashProps> = ({ user, isLoading = false, redirectDelay = 2500 }) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Only start redirect timer when we have a user (authenticated)
  useEffect(() => {
    if (user && !isLoading) {
      setShouldRedirect(true);
      const timer = setTimeout(() => {
        router.replace('/dashboard');
      }, redirectDelay);

      return () => clearTimeout(timer);
    }
  }, [router, redirectDelay, user, isLoading]);

  // Use app-specific displayName first, then fall back to synced name, then username
  const userName = user?.displayName || user?.name || user?.username || (user?.fid ? `User ${user.fid}` : '');
  // Use app-specific profilePicture first, then fall back to synced pfpUrl
  const userPicture = user?.profilePicture || user?.pfpUrl;
  
  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '';

  return (
    <SplashContainer>
      <LogoContainer>
        <Logo>
          DJ Tap-In
        </Logo>
      </LogoContainer>
      
      <ProfileSection>
        {user ? (
          <>
            <ProfileImageContainer>
              {userPicture && !imageError ? (
                <ProfileImage
                  src={userPicture}
                  alt={userName}
                  onError={() => setImageError(true)}
                />
              ) : (
                <DefaultAvatar>{initials}</DefaultAvatar>
              )}
            </ProfileImageContainer>
            <WelcomeText>Welcome back, {userName}!</WelcomeText>
            <SubText>Loading your dashboard...</SubText>
          </>
        ) : (
          <>
            <LoadingSpinner />
            <WelcomeText>Welcome to the Queue</WelcomeText>
            <SubText>{isLoading ? 'Checking authentication...' : 'Preparing your experience...'}</SubText>
          </>
        )}
      </ProfileSection>
      
      {shouldRedirect && (
        <ProgressContainer>
          <ProgressBar duration={redirectDelay} />
        </ProgressContainer>
      )}
    </SplashContainer>
  );
};

export default Splash;
