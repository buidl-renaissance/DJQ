import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "@/contexts/UserContext";

// Import UserProvider synchronously to ensure it's ready to receive 
// auth context injected by Renaissance immediately on page load
export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}
