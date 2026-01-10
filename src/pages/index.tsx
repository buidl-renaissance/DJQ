import Head from "next/head";
import styled, { createGlobalStyle, ThemeProvider, DefaultTheme } from "styled-components";
import { useEffect } from "react";
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

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  position: relative;
  overflow: hidden;
  
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
    z-index: 1;
    pointer-events: none;
  }
`;

const Section = styled.section`
  position: relative;
  z-index: 2;
  padding: 5rem 1rem;
`;

const HeroSection = styled(Section)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100px;
    background: linear-gradient(to top, ${({ theme }) => theme.colors.background}, transparent);
    z-index: -1;
  }
`;

const GlitchHeading = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 900;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  position: relative;
  color: transparent;
  
  &::before, &::after {
    content: "Step Up. Plug In. Run the Decks.";
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
    animation: glitch-anim 2s infinite linear alternate-reverse;
  }
  
  &::after {
    left: -2px;
    text-shadow: 2px 0 ${({ theme }) => theme.colors.accent};
    animation: glitch-anim 3s infinite linear alternate-reverse;
  }
  
  @keyframes glitch-anim {
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
  }
`;

const SubHeading = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: clamp(1rem, 3vw, 1.5rem);
  max-width: 800px;
  margin-bottom: 2.5rem;
  color: rgba(224, 224, 224, 0.8);
  line-height: 1.6;
`;

const NeonButton = styled.button`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.2rem;
  font-weight: bold;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.secondary};
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  padding: 1rem 2.5rem;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 2px;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(255, 45, 149, 0.5);
  
  &:hover {
    background-color: rgba(255, 45, 149, 0.2);
    box-shadow: 0 0 20px rgba(255, 45, 149, 0.8);
    transform: translateY(-2px);
  }
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 45, 149, 0.4),
      transparent
    );
    transition: all 0.6s;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

const DarkSection = styled(Section)`
  background-color: ${({ theme }) => theme.colors.dark};
  clip-path: polygon(0 0, 100% 5%, 100% 95%, 0 100%);
  margin: 2rem 0;
  padding: 8rem 1rem;
`;

const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 4rem;
  color: ${({ theme }) => theme.colors.contrast};
  text-transform: uppercase;
  letter-spacing: 3px;
  position: relative;
  
  &::after {
    content: "";
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.accent}, ${({ theme }) => theme.colors.secondary});
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const FeatureCard = styled.div`
  background-color: rgba(26, 26, 26, 0.7);
  border: 1px solid rgba(57, 255, 20, 0.2);
  border-radius: 8px;
  padding: 2rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(57, 255, 20, 0.2);
  }
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, rgba(57, 255, 20, 0.1), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

const FeatureNumber = styled.div`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 3rem;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.accent};
  margin-bottom: 1rem;
  text-shadow: 0 0 10px rgba(57, 255, 20, 0.5);
`;

const FeatureTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.contrast};
`;

const FeatureText = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  color: rgba(224, 224, 224, 0.7);
  line-height: 1.6;
`;

const BenefitItem = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 2rem;
`;

const IconWrapper = styled.div`
  background-color: rgba(57, 255, 20, 0.2);
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  box-shadow: 0 0 10px rgba(57, 255, 20, 0.3);
`;

const BenefitContent = styled.div`
  flex: 1;
`;

const BenefitTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.contrast};
`;

const BenefitText = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  color: rgba(224, 224, 224, 0.7);
`;

const GradientSection = styled(Section)`
  background: linear-gradient(to bottom, #121212, ${({ theme }) => theme.colors.background});
  text-align: center;
`;

const TestimonialCard = styled.div`
  background-color: rgba(26, 26, 26, 0.7);
  border: 1px solid rgba(255, 45, 149, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(255, 45, 149, 0.2);
  }
`;

const TestimonialText = styled.p`
  font-style: italic;
  margin-bottom: 1rem;
  color: rgba(224, 224, 224, 0.8);
  line-height: 1.6;
  position: relative;
  
  &::before, &::after {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.secondary};
    opacity: 0.5;
  }
  
  &::before {
    content: "\u201C";
    position: absolute;
    left: -5px;
    top: -5px;
  }
  
  &::after {
    content: "\u201D";
    position: absolute;
    right: -5px;
    bottom: -5px;
  }
`;

const TestimonialAuthor = styled.p`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.contrast};
`;

const EventsContainer = styled.div`
  background-color: rgba(26, 26, 26, 0.7);
  border: 1px solid rgba(57, 255, 20, 0.2);
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 5rem;
`;

const MapPlaceholder = styled.div`
  height: 16rem;
  background-color: rgba(18, 18, 18, 0.8);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed rgba(57, 255, 20, 0.3);
  color: rgba(224, 224, 224, 0.5);
  font-family: ${({ theme }) => theme.fonts.body};
`;

const PartnerLogosContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  opacity: 0.7;
`;

const LogoPlaceholder = styled.div`
  width: 8rem;
  height: 3rem;
  background-color: rgba(26, 26, 26, 0.7);
  border: 1px solid rgba(224, 224, 224, 0.1);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(224, 224, 224, 0.5);
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.875rem;
`;

const Footer = styled.footer`
  padding: 2.5rem 1rem;
  background-color: ${({ theme }) => theme.colors.background};
  border-top: 1px solid rgba(224, 224, 224, 0.1);
  text-align: center;
`;

const FooterText = styled.p`
  color: rgba(224, 224, 224, 0.4);
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.875rem;
`;

export default function Home() {
  const { user, isLoading } = useUser();

  // Signal to Farcaster that the app is ready
  useEffect(() => {
    const callReady = async () => {
      // Only run on client side
      if (typeof window === 'undefined') return;
      
      try {
        // Dynamically import the SDK (client-side only)
        const { sdk } = await import("@farcaster/miniapp-sdk");
        
        if (sdk && sdk.actions && typeof sdk.actions.ready === 'function') {
          console.log('✅ [Index] Calling sdk.actions.ready()');
          await sdk.actions.ready();
          console.log('✅ [Index] Successfully called ready()');
        } else {
          console.warn('⚠️ [Index] SDK not available or ready() not found');
        }
      } catch (error) {
        console.error('❌ [Index] Error calling sdk.actions.ready():', error);
      }
    };

    // Call ready after component mounts
    callReady();
  }, []);

  // Show splash screen while loading or for authenticated users
  if (isLoading || user) {
    return (
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Splash user={user} isLoading={isLoading} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Container>
        <Head>
          <title>DJ Tap-In Queue | Step Up. Plug In. Run the Decks.</title>
          <meta
            name="description"
            content="Your city&apos;s dopest open decks experience — tap in for a 20-minute set, link up for back-to-backs, and keep the party rolling."
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        {/* Hero Section */}
        <HeroSection>
          <GlitchHeading>
            Step Up. Plug In. Run the Decks.
          </GlitchHeading>
          <SubHeading>
            Your city&apos;s dopest open decks experience — tap in for a 20-minute set,
            link up for back-to-backs, and keep the party rolling.
          </SubHeading>
          <NeonButton>
            Join the DJ Queue
          </NeonButton>
        </HeroSection>

        {/* How It Works */}
        <DarkSection>
          <SectionTitle>How It Works</SectionTitle>

          <Grid>
            <FeatureCard>
              <FeatureNumber>1</FeatureNumber>
              <FeatureTitle>Tap In, Take Over</FeatureTitle>
              <FeatureText>
                Join the lineup, tap to start when you&apos;re up, and drop your set
                — no awkward handoffs, just smooth transitions.
              </FeatureText>
            </FeatureCard>

            <FeatureCard>
              <FeatureNumber>2</FeatureNumber>
              <FeatureTitle>20 Minutes of Fame</FeatureTitle>
              <FeatureText>
                Every set is 15–20 minutes. Quick, high-energy performances that
                keep the vibe alive and the rotation moving.
              </FeatureText>
            </FeatureCard>

            <FeatureCard>
              <FeatureNumber>3</FeatureNumber>
              <FeatureTitle>
                Back-to-Backs Made Easy
              </FeatureTitle>
              <FeatureText>
                Want to team up with another DJ? Queue up together and bring the
                synergy to the decks.
              </FeatureText>
            </FeatureCard>

            <FeatureCard>
              <FeatureNumber>4</FeatureNumber>
              <FeatureTitle>Be Seen. Be Heard.</FeatureTitle>
              <FeatureText>
                Your name, style, and socials show up live on the crowd display.
                Let people know who&apos;s running the vibe.
              </FeatureText>
            </FeatureCard>
          </Grid>
        </DarkSection>

        {/* Why DJs Love It */}
        <Section>
          <SectionTitle>
            Why DJs Love It
          </SectionTitle>

          <Grid style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            <BenefitItem>
              <IconWrapper>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#39FF14"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </IconWrapper>
              <BenefitContent>
                <BenefitTitle>No stress signups</BenefitTitle>
                <BenefitText>Queue from your phone</BenefitText>
              </BenefitContent>
            </BenefitItem>

            <BenefitItem>
              <IconWrapper>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#39FF14"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </IconWrapper>
              <BenefitContent>
                <BenefitTitle>
                  Auto-timers & changeovers
                </BenefitTitle>
                <BenefitText>No dead air</BenefitText>
              </BenefitContent>
            </BenefitItem>

            <BenefitItem>
              <IconWrapper>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#39FF14"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </IconWrapper>
              <BenefitContent>
                <BenefitTitle>Live exposure</BenefitTitle>
                <BenefitText>Your name in lights, literally</BenefitText>
              </BenefitContent>
            </BenefitItem>

            <BenefitItem>
              <IconWrapper>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#39FF14"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </IconWrapper>
              <BenefitContent>
                <BenefitTitle>Network & collab</BenefitTitle>
                <BenefitText>
                  Find new B2B partners and link with other DJs in the scene
                </BenefitText>
              </BenefitContent>
            </BenefitItem>
          </Grid>
        </Section>

        {/* Join the Movement */}
        <GradientSection>
          <SectionTitle>Join the Movement</SectionTitle>
          <SubHeading style={{ marginBottom: "2.5rem" }}>
            Whether you&apos;re a seasoned selector or just starting out, the Tap-In
            Queue is your moment to shine.
          </SubHeading>
          <NeonButton style={{ marginBottom: "2rem" }}>
            Sign Up Now
          </NeonButton>
          <FeatureText style={{ maxWidth: "600px", margin: "0 auto" }}>
            Claim your spot. Run your set. Make your mark.
          </FeatureText>
        </GradientSection>

        {/* Social Proof / Visuals */}
        <DarkSection>
          <SectionTitle>
            The Community
          </SectionTitle>

          {/* Testimonials */}
          <Grid style={{ marginBottom: "5rem" }}>
            <TestimonialCard>
              <TestimonialText>
                &quot;The Tap-In Queue changed the game for our events. More DJs,
                better vibes, no drama.&quot;
              </TestimonialText>
              <TestimonialAuthor>DJ Spinz, Club Promoter</TestimonialAuthor>
            </TestimonialCard>
            <TestimonialCard>
              <TestimonialText>
                &quot;As a new DJ, this was the perfect way to get stage time without
                the pressure. Love it!&quot;
              </TestimonialText>
              <TestimonialAuthor>Sarah B, Emerging Artist</TestimonialAuthor>
            </TestimonialCard>
            <TestimonialCard>
              <TestimonialText>
                &quot;Found my favorite B2B partner through the queue system. Now
                we&apos;re booking shows together.&quot;
              </TestimonialText>
              <TestimonialAuthor>TechnoTom, Resident DJ</TestimonialAuthor>
            </TestimonialCard>
          </Grid>

          {/* Placeholder for map/events */}
          <EventsContainer>
            <FeatureTitle style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              Upcoming Events
            </FeatureTitle>
            <MapPlaceholder>
              Interactive map of events coming soon
            </MapPlaceholder>
          </EventsContainer>

          {/* Partner logos */}
          <FeatureTitle style={{ textAlign: "center", marginBottom: "2rem" }}>Our Partners</FeatureTitle>
          <PartnerLogosContainer>
            <LogoPlaceholder>Logo 1</LogoPlaceholder>
            <LogoPlaceholder>Logo 2</LogoPlaceholder>
            <LogoPlaceholder>Logo 3</LogoPlaceholder>
            <LogoPlaceholder>Logo 4</LogoPlaceholder>
            <LogoPlaceholder>Logo 5</LogoPlaceholder>
          </PartnerLogosContainer>
        </DarkSection>

        <Footer>
          <FooterText>
            © {new Date().getFullYear()} DJ Tap-In Queue. All rights reserved.
          </FooterText>
        </Footer>
      </Container>
    </ThemeProvider>
  );
}
