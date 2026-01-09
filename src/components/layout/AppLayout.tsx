import styled, { createGlobalStyle, ThemeProvider } from 'styled-components';
import Head from 'next/head';
import TabBar from './TabBar';
import { theme } from '@/styles/theme';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Space+Mono:wght@400;700&display=swap');
  
  * {
    box-sizing: border-box;
  }
  
  body {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.contrast};
    font-family: ${({ theme }) => theme.fonts.body};
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    min-height: 100vh;
  }
  
  /* CRT scanline effect */
  body::after {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: linear-gradient(
      rgba(18, 16, 16, 0) 50%, 
      rgba(0, 0, 0, 0.25) 50%
    );
    background-size: 100% 4px;
    z-index: 1000;
    pointer-events: none;
    opacity: 0.15;
  }
`;

const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  position: relative;
  padding-bottom: 80px; /* Space for tab bar */
  
  /* Grid pattern background */
  &::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      linear-gradient(90deg, rgba(57, 255, 20, 0.03) 1px, transparent 1px),
      linear-gradient(rgba(57, 255, 20, 0.03) 1px, transparent 1px);
    background-size: 20px 20px;
    z-index: 0;
    pointer-events: none;
  }
`;

const Content = styled.main`
  position: relative;
  z-index: 1;
`;

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AppLayout({ children, title = 'DJ Tap-In Queue' }: AppLayoutProps) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container>
        <Content>{children}</Content>
        <TabBar />
      </Container>
    </ThemeProvider>
  );
}
