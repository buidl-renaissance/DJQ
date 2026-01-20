import type { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';
import { uploadFile, generateEventImageKey, isStorageConfigured, extractKeyFromUrl, deleteFile } from '@/lib/storage';
import { getEventById, updateEvent } from '@/db/events';

// Maximum image width (height will scale proportionally)
const MAX_IMAGE_WIDTH = 1200;

// Disable body parsing to handle raw file data
export const config = {
  api: {
    bodyParser: false,
  },
};

type ResponseData = {
  imageUrl?: string;
  error?: string;
};

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Parse multipart form data manually
async function parseFormData(req: NextApiRequest): Promise<{ 
  buffer: Buffer; 
  contentType: string; 
  filename: string;
  eventId: string;
} | null> {
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

          let fileData: { buffer: Buffer; contentType: string; filename: string } | null = null;
          let eventId: string | null = null;

          for (const part of parts) {
            const partStr = part.toString('utf-8', 0, Math.min(part.length, 1000));
            
            // Check if this part contains the eventId field
            if (partStr.includes('name="eventId"') && !partStr.includes('filename=')) {
              const headerEndIndex = part.indexOf(Buffer.from('\r\n\r\n'));
              if (headerEndIndex !== -1) {
                let valueData = part.slice(headerEndIndex + 4);
                // Remove trailing \r\n if present
                if (valueData.length >= 2 && valueData[valueData.length - 2] === 13 && valueData[valueData.length - 1] === 10) {
                  valueData = valueData.slice(0, -2);
                }
                eventId = valueData.toString('utf-8').trim();
              }
              continue;
            }
            
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
              let fileBuffer = part.slice(headerEndIndex + 4);
              // Remove trailing \r\n if present
              if (fileBuffer.length >= 2 && fileBuffer[fileBuffer.length - 2] === 13 && fileBuffer[fileBuffer.length - 1] === 10) {
                fileBuffer = fileBuffer.slice(0, -2);
              }

              fileData = {
                buffer: fileBuffer,
                contentType: fileContentType,
                filename,
              };
            }
          }

          if (fileData && eventId) {
            resolve({
              ...fileData,
              eventId,
            });
            return;
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
    // Parse the uploaded file
    const fileData = await parseFormData(req);
    
    if (!fileData) {
      return res.status(400).json({ error: 'No file or eventId provided' });
    }

    const { buffer, contentType, filename, eventId } = fileData;

    // Verify event exists
    const existingEvent = await getEventById(eventId);
    if (!existingEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

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

    // Delete old event image if it exists and is from our storage
    if (existingEvent.imageUrl) {
      const oldKey = extractKeyFromUrl(existingEvent.imageUrl);
      if (oldKey && oldKey.startsWith('event-images/')) {
        try {
          await deleteFile(oldKey);
        } catch (err) {
          console.warn('Failed to delete old event image:', err);
          // Continue anyway
        }
      }
    }

    // Process image: resize to max width while maintaining aspect ratio
    console.log(`📁 Processing event image - eventId: ${eventId}, originalSize: ${buffer.length} bytes`);
    
    // Get image metadata to check dimensions
    const metadata = await sharp(buffer).metadata();
    const needsResize = metadata.width && metadata.width > MAX_IMAGE_WIDTH;
    
    let processedBuffer: Buffer;
    let outputContentType: string;
    
    if (needsResize) {
      // Resize and convert to JPEG for consistent output
      processedBuffer = await sharp(buffer)
        .resize(MAX_IMAGE_WIDTH, null, {
          fit: 'inside', // Maintain aspect ratio, fit within bounds
          withoutEnlargement: true, // Don't upscale smaller images
        })
        .jpeg({ quality: 85 })
        .toBuffer();
      outputContentType = 'image/jpeg';
      console.log(`📁 Resized image from ${metadata.width}x${metadata.height} to max width ${MAX_IMAGE_WIDTH}, newSize: ${processedBuffer.length} bytes`);
    } else {
      // Image is small enough, just optimize it
      processedBuffer = await sharp(buffer)
        .jpeg({ quality: 85 })
        .toBuffer();
      outputContentType = 'image/jpeg';
      console.log(`📁 Optimized image (no resize needed), newSize: ${processedBuffer.length} bytes`);
    }

    // Generate unique key for the file (always .jpg since we convert to JPEG)
    const key = generateEventImageKey(eventId, 'jpg');
    
    console.log(`📁 Uploading event image - eventId: ${eventId}, key: ${key}`);

    // Upload to DigitalOcean Spaces
    const uploadResult = await uploadFile(processedBuffer, key, outputContentType);
    
    console.log(`📁 Upload result - url: ${uploadResult.url}`);

    // Update event with new image URL
    await updateEvent(eventId, {
      imageUrl: uploadResult.url,
    });

    console.log(`✅ Event image uploaded for event ${eventId}: ${filename} -> ${uploadResult.url}`);

    return res.status(200).json({
      imageUrl: uploadResult.url,
    });
  } catch (error) {
    console.error('Error uploading event image:', error);
    
    if (error instanceof Error) {
      if (error.message === 'File too large') {
        return res.status(400).json({ error: 'File too large. Maximum size is 5MB' });
      }
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}
