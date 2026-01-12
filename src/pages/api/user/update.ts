import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById, updateUserProfile } from '@/db/user';

type ResponseData = {
  user?: {
    id: string;
    fid: string | null;
    username: string | null;
    name: string | null;
    pfpUrl: string | null;
    displayName: string | null;
    profilePicture: string | null;
  };
  error?: string;
};

// Simple URL validation
function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user via session cookie
    let userId: string | null = null;

    const cookies = req.headers.cookie || '';
    const sessionMatch = cookies.match(/user_session=([^;]+)/);
    
    if (sessionMatch && sessionMatch[1]) {
      userId = sessionMatch[1];
    }

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Verify user exists
    const existingUser = await getUserById(userId);
    if (!existingUser) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Parse and validate request body
    const { displayName, profilePicture } = req.body;

    // Build update data object
    const updateData: { displayName?: string; profilePicture?: string | null } = {};

    // Validate displayName if provided
    if (displayName !== undefined) {
      if (typeof displayName !== 'string') {
        return res.status(400).json({ error: 'displayName must be a string' });
      }

      const trimmedName = displayName.trim();
      
      if (trimmedName.length === 0) {
        return res.status(400).json({ error: 'displayName cannot be empty' });
      }

      if (trimmedName.length > 100) {
        return res.status(400).json({ error: 'displayName must be 100 characters or less' });
      }

      updateData.displayName = trimmedName;
    }

    // Validate profilePicture if provided
    if (profilePicture !== undefined) {
      if (profilePicture === null || profilePicture === '') {
        // Allow clearing the profile picture
        updateData.profilePicture = null;
      } else if (typeof profilePicture !== 'string') {
        return res.status(400).json({ error: 'profilePicture must be a string or null' });
      } else {
        const trimmedUrl = profilePicture.trim();
        
        if (trimmedUrl.length > 2000) {
          return res.status(400).json({ error: 'profilePicture must be 2000 characters or less' });
        }

        if (!isValidUrl(trimmedUrl)) {
          return res.status(400).json({ error: 'profilePicture must be a valid URL' });
        }

        updateData.profilePicture = trimmedUrl;
      }
    }

    // Ensure at least one field is being updated
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Update the user profile
    const updatedUser = await updateUserProfile(userId, updateData);

    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to update user' });
    }

    return res.status(200).json({
      user: {
        id: updatedUser.id,
        fid: updatedUser.fid ?? null,
        username: updatedUser.username ?? null,
        name: updatedUser.name ?? null,
        pfpUrl: updatedUser.pfpUrl ?? null,
        displayName: updatedUser.displayName ?? null,
        profilePicture: updatedUser.profilePicture ?? null,
      },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
