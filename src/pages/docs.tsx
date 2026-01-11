import styled, { ThemeProvider } from 'styled-components';
import Head from 'next/head';
import { useState } from 'react';
import { theme } from '@/styles/theme';

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.contrast};
  font-family: ${({ theme }) => theme.fonts.body};
  padding: 2rem;
  padding-bottom: 6rem;
`;

const Header = styled.header`
  max-width: 1000px;
  margin: 0 auto 3rem;
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.accent};
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 3px;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.contrast};
  opacity: 0.7;
  font-size: 1rem;
`;

const Section = styled.section`
  max-width: 1000px;
  margin: 0 auto 2rem;
`;

const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.secondary};
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.darkGray};
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const EndpointCard = styled.div<{ $isOpen?: boolean }>`
  background: ${({ theme }) => theme.colors.dark};
  border: 1px solid ${({ theme, $isOpen }) => $isOpen ? theme.colors.accent : theme.colors.darkGray};
  border-radius: 8px;
  margin-bottom: 0.75rem;
  overflow: hidden;
  transition: border-color 0.2s ease;
`;

const EndpointHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: ${({ theme }) => theme.colors.darkGray};
  }
`;

const MethodBadge = styled.span<{ $method: string }>`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  min-width: 60px;
  text-align: center;
  font-weight: bold;
  letter-spacing: 1px;
  background: ${({ $method }) => {
    switch ($method) {
      case 'GET': return '#2d5a27';
      case 'POST': return '#1a4d7c';
      case 'PATCH': return '#7c5a1a';
      case 'DELETE': return '#7c1a1a';
      default: return '#333';
    }
  }};
  color: ${({ $method }) => {
    switch ($method) {
      case 'GET': return '#7fff7f';
      case 'POST': return '#7fbfff';
      case 'PATCH': return '#ffbf7f';
      case 'DELETE': return '#ff7f7f';
      default: return '#fff';
    }
  }};
`;

const EndpointPath = styled.code`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.contrast};
  flex: 1;
`;

const EndpointDescription = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.contrast};
  opacity: 0.6;
`;

const ExpandIcon = styled.span<{ $isOpen: boolean }>`
  color: ${({ theme }) => theme.colors.accent};
  transform: rotate(${({ $isOpen }) => $isOpen ? '90deg' : '0deg'});
  transition: transform 0.2s ease;
`;

const EndpointDetails = styled.div`
  padding: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.darkGray};
  background: ${({ theme }) => theme.colors.background};
`;

const DetailSection = styled.div`
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailTitle = styled.h4`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.accent};
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ParamTable = styled.table`
  width: 100%;
  font-size: 0.85rem;
  border-collapse: collapse;
`;

const ParamRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.darkGray};

  &:last-child {
    border-bottom: none;
  }
`;

const ParamCell = styled.td`
  padding: 0.5rem 0.75rem;
  vertical-align: top;

  &:first-child {
    width: 140px;
    color: ${({ theme }) => theme.colors.secondary};
    font-family: ${({ theme }) => theme.fonts.body};
  }
`;

const ParamType = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.accent};
  opacity: 0.8;
  margin-left: 0.5rem;
`;

const ParamRequired = styled.span`
  font-size: 0.65rem;
  color: #ff6b6b;
  margin-left: 0.5rem;
`;

const CodeBlock = styled.pre`
  background: ${({ theme }) => theme.colors.darkGray};
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.contrast};
`;

const BackLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.accent};
  text-decoration: none;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  opacity: 0.8;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

interface Endpoint {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
  body?: { name: string; type: string; required: boolean; description: string }[];
  response?: string;
}

interface EndpointSection {
  title: string;
  endpoints: Endpoint[];
}

const apiDocs: EndpointSection[] = [
  {
    title: 'Authentication',
    endpoints: [
      {
        method: 'POST',
        path: '/api/auth/miniapp',
        description: 'Authenticate user from Farcaster Mini App SDK context',
        body: [
          { name: 'fid', type: 'string', required: true, description: 'Farcaster ID' },
          { name: 'username', type: 'string', required: false, description: 'Farcaster username' },
          { name: 'displayName', type: 'string', required: false, description: 'Display name' },
          { name: 'pfpUrl', type: 'string', required: false, description: 'Profile picture URL' },
        ],
        response: `{
  "success": true,
  "user": {
    "id": "uuid",
    "fid": "12345",
    "username": "alice",
    "displayName": "Alice",
    "pfpUrl": "https://..."
  }
}`,
      },
      {
        method: 'POST',
        path: '/api/auth/verify',
        description: 'Verify Quick Auth JWT token or SIWF message+signature',
        body: [
          { name: 'token', type: 'string', required: false, description: 'Quick Auth JWT token' },
          { name: 'message', type: 'string', required: false, description: 'SIWF message (hex)' },
          { name: 'signature', type: 'string', required: false, description: 'SIWF signature' },
        ],
        response: `{
  "success": true,
  "user": { ... }
}`,
      },
      {
        method: 'POST',
        path: '/api/auth/register',
        description: 'Register a new user with phone number',
        body: [
          { name: 'username', type: 'string', required: true, description: 'Unique username' },
          { name: 'name', type: 'string', required: true, description: 'Display name' },
          { name: 'phone', type: 'string', required: true, description: 'Phone number (for login)' },
          { name: 'email', type: 'string', required: false, description: 'Email address' },
        ],
        response: `{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "alice",
    "displayName": "Alice",
    "phone": "+15551234567",
    "email": "alice@example.com"
  }
}`,
      },
      {
        method: 'POST',
        path: '/api/auth/phone-login',
        description: 'Login with phone number (no verification)',
        body: [
          { name: 'phone', type: 'string', required: true, description: 'Phone number' },
        ],
        response: `{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "alice",
    "displayName": "Alice",
    "phone": "+15551234567"
  }
}`,
      },
    ],
  },
  {
    title: 'Events',
    endpoints: [
      {
        method: 'GET',
        path: '/api/events',
        description: 'List all published/active events with slot availability',
        response: `{
  "events": [{
    "id": "uuid",
    "title": "Saturday Night",
    "eventDate": "2025-01-15",
    "startTime": "2025-01-15T20:00:00",
    "endTime": "2025-01-15T02:00:00",
    "slotDurationMinutes": 60,
    "allowB2B": true,
    "allowConsecutiveSlots": true,
    "status": "published",
    "availableSlots": 4,
    "totalSlots": 6
  }]
}`,
      },
      {
        method: 'POST',
        path: '/api/events',
        description: 'Create a new event (host only)',
        body: [
          { name: 'username', type: 'string', required: true, description: 'Host username' },
          { name: 'title', type: 'string', required: true, description: 'Event title' },
          { name: 'description', type: 'string', required: false, description: 'Event description' },
          { name: 'eventDate', type: 'ISO date', required: true, description: 'Date of the event' },
          { name: 'startTime', type: 'ISO datetime', required: true, description: 'Start time' },
          { name: 'endTime', type: 'ISO datetime', required: true, description: 'End time' },
          { name: 'slotDurationMinutes', type: 'number', required: true, description: 'Duration per slot' },
          { name: 'allowConsecutiveSlots', type: 'boolean', required: false, description: 'Allow booking multiple slots' },
          { name: 'maxConsecutiveSlots', type: 'number', required: false, description: 'Max consecutive slots' },
          { name: 'allowB2B', type: 'boolean', required: false, description: 'Allow B2B requests' },
          { name: 'publish', type: 'boolean', required: false, description: 'Publish immediately' },
        ],
        response: `{ "event": { ... } }`,
      },
      {
        method: 'GET',
        path: '/api/events/[id]',
        description: 'Get event details with all time slots and booking info',
        params: [
          { name: 'id', type: 'string', required: true, description: 'Event ID' },
        ],
        response: `{
  "event": { ... },
  "slots": [{
    "id": "uuid",
    "startTime": "2025-01-15T20:00:00",
    "endTime": "2025-01-15T21:00:00",
    "slotIndex": 0,
    "status": "available|booked",
    "booking": {
      "id": "uuid",
      "djId": "uuid",
      "djName": "DJ Name",
      "b2bPartner": "Partner Name"
    }
  }]
}`,
      },
      {
        method: 'POST',
        path: '/api/events/[id]/book',
        description: 'Book one or more time slots for an event',
        params: [
          { name: 'id', type: 'string', required: true, description: 'Event ID' },
        ],
        body: [
          { name: 'slotIds', type: 'string[]', required: true, description: 'Array of slot IDs to book' },
          { name: 'username', type: 'string', required: true, description: 'DJ username' },
        ],
        response: `{ "bookings": [{ ... }] }`,
      },
    ],
  },
  {
    title: 'Bookings',
    endpoints: [
      {
        method: 'GET',
        path: '/api/bookings',
        description: "Get user's bookings with event info and B2B status",
        params: [
          { name: 'username', type: 'string', required: true, description: 'User username' },
        ],
        response: `{
  "bookings": [{
    "id": "uuid",
    "eventId": "uuid",
    "eventTitle": "Saturday Night",
    "eventDate": "2025-01-15",
    "slotStartTime": "2025-01-15T20:00:00",
    "slotEndTime": "2025-01-15T21:00:00",
    "status": "confirmed",
    "b2bPartner": "Partner Name",
    "hasPendingB2B": false
  }]
}`,
      },
      {
        method: 'GET',
        path: '/api/bookings/[id]',
        description: 'Get detailed booking info including B2B status',
        params: [
          { name: 'id', type: 'string', required: true, description: 'Booking ID' },
          { name: 'username', type: 'string', required: false, description: 'Username for auth check' },
        ],
        response: `{
  "booking": {
    "id": "uuid",
    "status": "confirmed",
    "eventId": "uuid",
    "eventTitle": "Saturday Night",
    "eventDate": "2025-01-15",
    "slotStartTime": "...",
    "slotEndTime": "...",
    "b2bPartner": { "id": "...", "displayName": "...", "username": "..." },
    "pendingB2BRequest": { "id": "...", "targetUser": { ... } },
    "allowB2B": true
  }
}`,
      },
      {
        method: 'DELETE',
        path: '/api/bookings/[id]',
        description: 'Cancel a booking',
        params: [
          { name: 'id', type: 'string', required: true, description: 'Booking ID' },
        ],
        body: [
          { name: 'username', type: 'string', required: false, description: 'Username for auth' },
        ],
        response: `{ "success": true }`,
      },
      {
        method: 'POST',
        path: '/api/bookings/[id]/b2b',
        description: 'Create a B2B (back-to-back) request for a booking',
        params: [
          { name: 'id', type: 'string', required: true, description: 'Booking ID' },
        ],
        body: [
          { name: 'username', type: 'string', required: true, description: 'Requester username' },
          { name: 'targetUsername', type: 'string', required: true, description: 'Target DJ username' },
        ],
        response: `{ "request": { ... } }`,
      },
    ],
  },
  {
    title: 'B2B Requests',
    endpoints: [
      {
        method: 'GET',
        path: '/api/b2b/pending',
        description: 'Get pending B2B requests for a user',
        params: [
          { name: 'username', type: 'string', required: true, description: 'User username' },
        ],
        response: `{
  "requests": [{
    "id": "uuid",
    "requesterName": "DJ Name",
    "requesterUsername": "dj_name",
    "eventTitle": "Saturday Night",
    "slotTime": "8:00 PM - 9:00 PM",
    "initiatedBy": "booker|requester"
  }]
}`,
      },
      {
        method: 'PATCH',
        path: '/api/b2b/[id]',
        description: 'Accept or decline a B2B request',
        params: [
          { name: 'id', type: 'string', required: true, description: 'B2B request ID' },
        ],
        body: [
          { name: 'action', type: '"accept" | "decline"', required: true, description: 'Action to take' },
          { name: 'username', type: 'string', required: true, description: 'Requestee username' },
        ],
        response: `{ "request": { ... } }`,
      },
    ],
  },
  {
    title: 'Host Events',
    endpoints: [
      {
        method: 'GET',
        path: '/api/host/events',
        description: "Get host's events with booking stats",
        params: [
          { name: 'username', type: 'string', required: true, description: 'Host username' },
        ],
        response: `{
  "events": [{
    "id": "uuid",
    "title": "Saturday Night",
    "eventDate": "2025-01-15",
    "startTime": "...",
    "endTime": "...",
    "slotDurationMinutes": 60,
    "status": "draft|published|active",
    "totalSlots": 6,
    "bookedSlots": 2
  }]
}`,
      },
      {
        method: 'GET',
        path: '/api/host/events/[id]',
        description: 'Get host event details with full slot/booking info',
        params: [
          { name: 'id', type: 'string', required: true, description: 'Event ID' },
          { name: 'username', type: 'string', required: false, description: 'Username for auth' },
        ],
        response: `{
  "event": { ... },
  "slots": [{ ..., "booking": { "djName": "...", "b2bPartner": "..." } }]
}`,
      },
      {
        method: 'DELETE',
        path: '/api/host/events/[id]',
        description: 'Delete an event (host only)',
        params: [
          { name: 'id', type: 'string', required: true, description: 'Event ID' },
          { name: 'username', type: 'string', required: false, description: 'Username for auth' },
        ],
        response: `{ "success": true }`,
      },
      {
        method: 'POST',
        path: '/api/host/events/[id]/publish',
        description: 'Publish a draft event',
        params: [
          { name: 'id', type: 'string', required: true, description: 'Event ID' },
        ],
        body: [
          { name: 'username', type: 'string', required: false, description: 'Username for auth' },
        ],
        response: `{ "event": { ... } }`,
      },
    ],
  },
  {
    title: 'Users',
    endpoints: [
      {
        method: 'GET',
        path: '/api/user/me',
        description: 'Get current authenticated user',
        params: [
          { name: 'userId', type: 'string', required: false, description: 'User ID (alt to cookie)' },
        ],
        response: `{
  "user": {
    "id": "uuid",
    "fid": "12345",
    "username": "alice",
    "displayName": "Alice",
    "pfpUrl": "https://..."
  }
}`,
      },
      {
        method: 'GET',
        path: '/api/users',
        description: 'List users (for B2B partner search)',
        response: `{
  "users": [{
    "id": "uuid",
    "displayName": "DJ Name",
    "username": "dj_name"
  }]
}`,
      },
    ],
  },
];

function EndpointItem({ endpoint }: { endpoint: Endpoint }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <EndpointCard $isOpen={isOpen}>
      <EndpointHeader onClick={() => setIsOpen(!isOpen)}>
        <MethodBadge $method={endpoint.method}>{endpoint.method}</MethodBadge>
        <EndpointPath>{endpoint.path}</EndpointPath>
        <EndpointDescription>{endpoint.description}</EndpointDescription>
        <ExpandIcon $isOpen={isOpen}>▶</ExpandIcon>
      </EndpointHeader>
      {isOpen && (
        <EndpointDetails>
          {endpoint.params && endpoint.params.length > 0 && (
            <DetailSection>
              <DetailTitle>Query Parameters</DetailTitle>
              <ParamTable>
                <tbody>
                  {endpoint.params.map((param) => (
                    <ParamRow key={param.name}>
                      <ParamCell>
                        {param.name}
                        <ParamType>{param.type}</ParamType>
                        {param.required && <ParamRequired>required</ParamRequired>}
                      </ParamCell>
                      <ParamCell>{param.description}</ParamCell>
                    </ParamRow>
                  ))}
                </tbody>
              </ParamTable>
            </DetailSection>
          )}
          {endpoint.body && endpoint.body.length > 0 && (
            <DetailSection>
              <DetailTitle>Request Body</DetailTitle>
              <ParamTable>
                <tbody>
                  {endpoint.body.map((param) => (
                    <ParamRow key={param.name}>
                      <ParamCell>
                        {param.name}
                        <ParamType>{param.type}</ParamType>
                        {param.required && <ParamRequired>required</ParamRequired>}
                      </ParamCell>
                      <ParamCell>{param.description}</ParamCell>
                    </ParamRow>
                  ))}
                </tbody>
              </ParamTable>
            </DetailSection>
          )}
          {endpoint.response && (
            <DetailSection>
              <DetailTitle>Response Example</DetailTitle>
              <CodeBlock>{endpoint.response}</CodeBlock>
            </DetailSection>
          )}
        </EndpointDetails>
      )}
    </EndpointCard>
  );
}

export default function DocsPage() {
  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>API Documentation | DJQ</title>
        <meta name="description" content="API documentation for DJQ - DJ Queue booking system" />
      </Head>
      <Container>
        <Header>
          <BackLink href="/">← Back to App</BackLink>
          <Title>API Docs</Title>
          <Subtitle>
            RESTful API endpoints for DJ Queue event and booking management. 
            All endpoints return JSON responses.
          </Subtitle>
        </Header>

        {apiDocs.map((section) => (
          <Section key={section.title}>
            <SectionTitle>{section.title}</SectionTitle>
            {section.endpoints.map((endpoint) => (
              <EndpointItem 
                key={`${endpoint.method}-${endpoint.path}`} 
                endpoint={endpoint} 
              />
            ))}
          </Section>
        ))}
      </Container>
    </ThemeProvider>
  );
}
