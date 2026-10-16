// src/utils/mediaUtils.js

/**
 * Normalizes media URLs returned by the backend (e.g. cover images or uploaded files).
 * If the URL is an absolute URL pointing to /media/ without the client port or on localhost,
 * converts it to a clean relative path so the browser requests it on the active origin and port.
 *
 * @param {string} url - The image or media URL.
 * @returns {string} - The normalized URL.
 */
export const formatMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return '';

  // Data URLs or blob URLs for local preview
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  // Already a relative media path
  if (url.startsWith('/media/')) {
    return url;
  }

  try {
    const parsed = new URL(url);
    // If it points to /media/ on localhost or any host, use relative path to keep client port
    if (parsed.pathname.startsWith('/media/')) {
      return parsed.pathname;
    }
  } catch {
    // If not a full URL but starts with media/, prepend leading slash
    if (url.startsWith('media/')) {
      return `/${url}`;
    }
  }

  return url;
};

/**
 * Normalizes image src URLs inside raw HTML content to relative /media/ paths.
 *
 * @param {string} html - HTML string content.
 * @returns {string} - Cleaned HTML string with relative media URLs.
 */
export const formatMediaHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  return html.replace(/src=["']https?:\/\/[^\/]+\/media\//gi, 'src="/media/');
};

/**
 * Extracts and formats embeddable video URL for Aparat and YouTube.
 * Handles plain watch URLs, short URLs, and pasted <iframe> snippets.
 *
 * @param {string} raw - The raw input URL or iframe snippet.
 * @returns {string|null} - The clean embed URL suitable for an iframe src.
 */
export const formatVideoEmbedUrl = (raw) => {
  if (!raw || typeof raw !== 'string') return null;

  let url = raw.trim();

  // If user pasted an iframe snippet, extract the src attribute
  const iframeMatch = url.match(/src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    url = iframeMatch[1].trim();
  }

  // Aparat URL handling
  if (url.includes('aparat.com')) {
    // Already in embed format: https://www.aparat.com/video/video/embed/videohash/.../vt/frame
    if (url.includes('/video/video/embed/videohash/')) {
      return url;
    }
    // Match hash from /v/HASH or /embed/HASH
    const aparatMatch = url.match(/aparat\.com\/(?:v|embed)\/([a-zA-Z0-9_-]+)/i);
    if (aparatMatch && aparatMatch[1]) {
      return `https://www.aparat.com/video/video/embed/videohash/${aparatMatch[1]}/vt/frame`;
    }
    return url;
  }

  // YouTube URL handling
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    if (url.includes('youtube.com/embed/') || url.includes('youtube-nocookie.com/embed/')) {
      return url;
    }
    // Match ID from watch?v=ID or youtu.be/ID or shorts/ID
    const ytMatch = url.match(/(?:youtu\.be\/|watch\?v=|shorts\/)([a-zA-Z0-9_-]+)/i);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`;
    }
    return url;
  }

  return url;
};
