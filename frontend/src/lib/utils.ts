import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a YouTube URL to its embed format
 * @param url YouTube URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/dQw4w9WgXcQ)
 * @returns YouTube embed URL (e.g., https://www.youtube.com/embed/dQw4w9WgXcQ)
 */
export function getYoutubeEmbedUrl(url: string | undefined): string {
  if (!url) return '';
  
  // Return if already an embed URL
  if (url.includes('/embed/')) return url;
  
  // Extract video ID using regex patterns for various YouTube URL formats
  let videoId: string | null = null;
  
  // Pattern for: https://www.youtube.com/watch?v=VIDEO_ID
  const watchPattern = /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.+&v=)([^&]+)/;
  const watchMatch = url.match(watchPattern);
  
  if (watchMatch) {
    videoId = watchMatch[1];
  } else {
    // Pattern for: https://youtu.be/VIDEO_ID
    const shortPattern = /(?:youtu\.be\/)([^?&]+)/;
    const shortMatch = url.match(shortPattern);
    
    if (shortMatch) {
      videoId = shortMatch[1];
    }
  }
  
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  // Return original URL if no patterns match
  return url;
}
