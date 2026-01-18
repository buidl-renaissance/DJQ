import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "styled-components";
import { UserProvider, useUser } from "@/contexts/UserContext";
import DeactivatedAccountScreen from "@/components/DeactivatedAccountScreen";
import { theme } from "@/styles/theme";
import { Analytics } from "@vercel/analytics/next";

// Wrapper component that checks user status and shows deactivated screen if needed
function AppContent({ Component, pageProps }: AppProps) {
  const { user, isLoading } = useUser();

  // Don't block while loading - show the app (will show loading states)
  if (isLoading) {
    return <Component {...pageProps} />;
  }

  // If user is deactivated (inactive), show the deactivated screen
  if (user && user.status === 'inactive') {
    return (
      <ThemeProvider theme={theme}>
        <DeactivatedAccountScreen />
      </ThemeProvider>
    );
  }

  return <Component {...pageProps} />;
}

// Import UserProvider synchronously to ensure it's ready to receive 
// auth context injected by Renaissance immediately on page load
export default function App(appProps: AppProps) {
  return (
    <UserProvider>
      <AppContent {...appProps} />
      <Analytics />
    </UserProvider>
  );
}
