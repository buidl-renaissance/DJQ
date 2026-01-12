import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserById, updateUserProfile } from '@/db/user';
import { uploadFile, generateProfilePictureKey, isStorageConfigured, extractKeyFromUrl, deleteFile } from '@/lib/storage';

// Disable body parsing to handle raw file data
export const config = {
  api: {
    bodyParser: false,
  },
};

type ResponseData = {
  user?: {
    id: string;
    fid: string | null;
    username: string | null;
    displayName: string | null;
    pfpUrl: string | null;
  };
  error?: string;
};

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Parse multipart form data manually
async function parseFormData(req: NextApiRequest): Promise<{ buffer: Buffer; contentType: string; filename: string } | null> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalSize = 0;

    req.on('data', (chunk: Buffer) => {
      totalSize += chunk.length;
      if (totalSize > MAX_FILE_SIZE + 10000) { // Add some buffer for form overhead
        reject(new Error('File too large'));
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      try {
        const buffer = Buffer.concat(chunks);
        const contentType = req.headers['content-type'] || '';
        
        // Handle multipart/form-data
        if (contentType.includes('multipart/form-data')) {
          const boundary = contentType.split('boundary=')[1];
          if (!boundary) {
            resolve(null);
            return;
          }

          const boundaryBuffer = Buffer.from(`--${boundary}`);
          const parts = splitBuffer(buffer, boundaryBuffer);

          for (const part of parts) {
            const partStr = part.toString('utf-8', 0, Math.min(part.length, 1000));
            
            // Check if this part contains the file
            if (partStr.includes('Content-Disposition') && partStr.includes('filename=')) {
              // Extract content type from part headers
              const typeMatch = partStr.match(/Content-Type:\s*([^\r\n]+)/i);
              const fileContentType = typeMatch ? typeMatch[1].trim() : 'application/octet-stream';
              
              // Extract filename
              const filenameMatch = partStr.match(/filename="([^"]+)"/);
              const filename = filenameMatch ? filenameMatch[1] : 'upload';

              // Find the start of file data (after \r\n\r\n)
              const headerEndIndex = part.indexOf(Buffer.from('\r\n\r\n'));
              if (headerEndIndex === -1) {
                continue;
              }

              // Extract file data (skip headers and trailing \r\n)
              let fileData = part.slice(headerEndIndex + 4);
              // Remove trailing \r\n if present
              if (fileData.length >= 2 && fileData[fileData.length - 2] === 13 && fileData[fileData.length - 1] === 10) {
                fileData = fileData.slice(0, -2);
              }

              resolve({
                buffer: fileData,
                contentType: fileContentType,
                filename,
              });
              return;
            }
          }
        }

        resolve(null);
      } catch (err) {
        reject(err);
      }
    });

    req.on('error', reject);
  });
}

// Helper to split buffer by boundary
function splitBuffer(buffer: Buffer, boundary: Buffer): Buffer[] {
  const parts: Buffer[] = [];
  let start = 0;
  let index = buffer.indexOf(boundary, start);

  while (index !== -1) {
    if (start !== index) {
      parts.push(buffer.slice(start, index));
    }
    start = index + boundary.length;
    index = buffer.indexOf(boundary, start);
  }

  if (start < buffer.length) {
    parts.push(buffer.slice(start));
  }

  return parts;
}

// Get file extension from content type
function getExtension(contentType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  };
  return map[contentType] || 'jpg';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if storage is configured
  if (!isStorageConfigured()) {
    return res.status(500).json({ error: 'File storage not configured' });
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

    // Parse the uploaded file
    const fileData = await parseFormData(req);
    
    if (!fileData) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { buffer, contentType, filename } = fileData;

    // Validate content type
    if (!ALLOWED_TYPES.includes(contentType)) {
      return res.status(400).json({ 
        error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}` 
      });
    }

    // Validate file size
    if (buffer.length > MAX_FILE_SIZE) {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB' });
    }

    // Delete old profile picture if it exists and is from our storage
    if (existingUser.pfpUrl) {
      const oldKey = extractKeyFromUrl(existingUser.pfpUrl);
      if (oldKey && oldKey.startsWith('profile-pictures/')) {
        try {
          await deleteFile(oldKey);
        } catch (err) {
          console.warn('Failed to delete old profile picture:', err);
          // Continue anyway
        }
      }
    }

    // Generate unique key for the file
    const extension = getExtension(contentType);
    const key = generateProfilePictureKey(userId, extension);
    
    console.log(`📁 Uploading avatar - userId: ${userId}, key: ${key}, contentType: ${contentType}`);

    // Upload to DigitalOcean Spaces
    const uploadResult = await uploadFile(buffer, key, contentType);
    
    console.log(`📁 Upload result - url: ${uploadResult.url}`);

    // Update user's profile with new avatar URL
    const updatedUser = await updateUserProfile(userId, {
      pfpUrl: uploadResult.url,
    });

    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to update user profile' });
    }

    console.log(`✅ Avatar uploaded for user ${userId}: ${filename} -> ${uploadResult.url}`);

    return res.status(200).json({
      user: {
        id: updatedUser.id,
        fid: updatedUser.fid ?? null,
        username: updatedUser.username ?? null,
        displayName: updatedUser.displayName ?? null,
        pfpUrl: updatedUser.pfpUrl ?? null,
      },
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    
    if (error instanceof Error) {
      if (error.message === 'File too large') {
        return res.status(400).json({ error: 'File too large. Maximum size is 5MB' });
      }
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}
