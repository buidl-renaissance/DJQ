import { DefaultTheme } from 'styled-components';

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
export const theme: DefaultTheme = {
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

export default theme;
