import Head from "next/head";
import { createGlobalStyle, ThemeProvider, DefaultTheme } from "styled-components";
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import Splash from "@/components/Splash";

// Extend DefaultTheme to include our custom properties
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      background: string;
      accent: string;
      secondary: string;
      contrast: string;
      dark: string;
      darkGray: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
  }
}

// Theme definition
const theme: DefaultTheme = {
  colors: {
    background: "#0A0A0A",
    accent: "#39FF14",
    secondary: "#FF2D95",
    contrast: "#E0E0E0",
    dark: "#121212",
    darkGray: "#1A1A1A",
  },
  fonts: {
    heading: "'Orbitron', sans-serif",
    body: "'Space Mono', monospace",
  },
};

// Global styles with CRT scanlines
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Space+Mono:wght@400;700&display=swap');
  
  body {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.contrast};
    font-family: ${({ theme }) => theme.fonts.body};
    margin: 0;
    padding: 0;
    overflow-x: hidden;
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

/**
 * App entry point - handles authentication loading and splash screen
 * Redirects authenticated users to /dashboard
 */
export default function AppPage() {
  const { user, isLoading } = useUser();
  const [mounted, setMounted] = useState(false);

  // Mark as mounted after hydration to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Signal to Farcaster that the app is ready
  useEffect(() => {
    const callReady = async () => {
      // Only run on client side
      if (typeof window === 'undefined') return;
      
      try {
        // Dynamically import the SDK (client-side only)
        const { sdk } = await import("@farcaster/miniapp-sdk");
        
        if (sdk && sdk.actions && typeof sdk.actions.ready === 'function') {
          console.log('✅ [App] Calling sdk.actions.ready()');
          await sdk.actions.ready();
          console.log('✅ [App] Successfully called ready()');
        } else {
          console.warn('⚠️ [App] SDK not available or ready() not found');
        }
      } catch (error) {
        console.error('❌ [App] Error calling sdk.actions.ready():', error);
      }
    };

    // Call ready after component mounts
    callReady();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Head>
        <title>DJ Tap-In Queue | Loading...</title>
        <meta name="description" content="Your city's dopest open decks experience" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* Only pass user after hydration to prevent mismatch */}
      <Splash user={mounted ? user : null} isLoading={!mounted || isLoading} />
    </ThemeProvider>
  );
}
