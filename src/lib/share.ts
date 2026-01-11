/**
 * Share utility using native Web Share API with clipboard fallback
 */

export interface ShareData {
  title: string;
  text: string;
  url: string;
}

/**
 * Check if native sharing is available
 */
export function canShare(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.share;
}

/**
 * Share content using native share dialog or copy to clipboard as fallback
 * @returns Promise that resolves to 'shared' | 'copied' | 'cancelled' | 'failed'
 */
export async function share(data: ShareData): Promise<'shared' | 'copied' | 'cancelled' | 'failed'> {
  // Try native share first
  if (canShare()) {
    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url,
      });
      return 'shared';
    } catch (err) {
      // User cancelled or share failed
      if (err instanceof Error && err.name === 'AbortError') {
        return 'cancelled';
      }
      // Fall through to clipboard fallback
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(data.url);
    return 'copied';
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return 'failed';
  }
}

/**
 * Get the base URL for sharing (works in browser only)
 */
export function getBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
}
