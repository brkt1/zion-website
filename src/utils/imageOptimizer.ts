/**
 * Automatic Image Optimization Utility
 * Converts images to WebP, creates responsive sizes, and optimizes delivery
 */

// Check if browser supports WebP
const supportsWebP = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

// Check if browser supports AVIF (even better than WebP)
const supportsAVIF = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  try {
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  } catch {
    return false;
  }
};

/**
 * Optimize image URL using a free image optimization service
 * Uses Cloudinary's free tier or similar service for automatic optimization
 */
export const optimizeImageUrl = (
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    fit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  } = {}
): string => {
  if (!url) return url;

  // If it's already an optimized URL or a data URL, return as-is
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  // For local images, optimize using weserv.nl with the full origin URL
  // This allows us to resize and convert local images (like logo.png) to WebP/AVIF
  if (url.startsWith('/') && !url.startsWith('//')) {
    // In development (localhost), weserv.nl might not be able to access local images
    // So we'll only optimize if we have width/height specified and we're in production
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    
    // Get the full URL for local images
    const fullUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}${url}`
      : url;

    // Destructure options for use
    const {
      width,
      height,
      quality = 60,
      format = 'auto',
      fit
    } = options;

    // If no optimization options provided, return as-is
    if (!width && !height && quality === 60 && format === 'auto') {
      return url;
    }

    // In localhost, weserv.nl can't access local files, so return original
    // The browser will still resize it via CSS, which is acceptable for development
    if (isLocalhost) {
      return url;
    }

    // Otherwise, optimize using weserv.nl

    const params: string[] = [];
    
    if (width) params.push(`w=${width}`);
    if (height) params.push(`h=${height}`);
    if (fit) {
      const fitMap: Record<string, string> = {
        cover: 'cover',
        contain: 'inside',
        fill: 'fill',
        'scale-down': 'inside',
      };
      params.push(`fit=${fitMap[fit] || 'cover'}`);
    }
    
    let finalFormat = format;
    if (format === 'auto') {
      // Always try to use modern formats for better compression
      if (supportsAVIF()) {
        finalFormat = 'avif';
      } else if (supportsWebP()) {
        finalFormat = 'webp';
      } else {
        // Even if browser doesn't support it, request WebP anyway
        // Modern browsers will handle it, and it's much smaller than PNG
        finalFormat = 'webp';
      }
    }
    
    // Always convert to modern format for local images too
    if (finalFormat === 'avif') {
      params.push('output=avif');
    } else if (finalFormat === 'webp') {
      params.push('output=webp');
    } else if (format === 'auto') {
      // Fallback: always use WebP for auto format if not already set
      params.push('output=webp');
    }
    
    const optimizedQuality = quality > 60 ? 60 : quality;
    params.push(`q=${optimizedQuality}`);
    
    const queryString = params.length > 0 ? '?' + params.join('&') : '';
    const weservBase = 'https://images.weserv.nl';
    return `${weservBase}${queryString}&url=${encodeURIComponent(fullUrl)}`;
  }

  const {
    width,
    height,
    quality = 60,
    format = 'auto',
    fit = 'cover',
  } = options;

  // Use a reliable free image optimization service
  // Using images.weserv.nl - a free, reliable image proxy service
  // It supports WebP conversion, resizing, and quality optimization
  
  // Build transformation parameters for Weserv
  const params: string[] = [];
  
  if (width) params.push(`w=${width}`);
  if (height) params.push(`h=${height}`);
  if (fit) {
    // Map fit values to Weserv format
    const fitMap: Record<string, string> = {
      cover: 'cover',
      contain: 'inside',
      fill: 'fill',
      'scale-down': 'inside',
    };
    params.push(`fit=${fitMap[fit] || 'cover'}`);
  }
  
  // Auto-detect best format - always prefer modern formats for external images
  let finalFormat = format;
  if (format === 'auto') {
    // Always try to use modern formats for better compression
    // Most modern browsers support WebP, and AVIF is even better
    if (supportsAVIF()) {
      finalFormat = 'avif';
    } else if (supportsWebP()) {
      finalFormat = 'webp';
    } else {
      // Even if browser doesn't support it, request WebP anyway
      // Modern browsers will handle it, and it's much smaller than JPG
      finalFormat = 'webp';
    }
  }
  
  // Weserv supports output format - always convert to modern format
  if (finalFormat === 'avif') {
    params.push('output=avif');
  } else if (finalFormat === 'webp') {
    params.push('output=webp');
  } else if (format === 'auto') {
    // Fallback: always use WebP for auto format if not already set
    params.push('output=webp');
  }
  
  // Quality (0-100, default 80) - reduce for better compression
  // Use lower quality for non-critical images to reduce file size
  // Cap at 60 for better compression (reduced from 65)
  const optimizedQuality = quality > 60 ? 60 : quality;
  params.push(`q=${optimizedQuality}`);

  const queryString = params.length > 0 ? '?' + params.join('&') : '';
  
  // Weserv format: https://images.weserv.nl/?url={encoded_url}&{params}
  const weservBase = 'https://images.weserv.nl';
  const optimizedUrl = `${weservBase}${queryString}&url=${encodeURIComponent(url)}`;
  
  return optimizedUrl;
};

/**
 * Generate responsive image srcset
 */
export const generateSrcSet = (
  baseUrl: string,
  widths: number[] = [400, 800, 1200, 1600, 2000],
  options: {
    quality?: number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  } = {}
): string => {
  return widths
    .map((width) => {
      const optimizedUrl = optimizeImageUrl(baseUrl, {
        ...options,
        width,
      });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
};

/**
 * Get optimized image URL with fallback
 */
export const getOptimizedImage = (
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    fallback?: string;
  } = {}
): { src: string; srcSet?: string; fallback?: string } => {
  const optimized = optimizeImageUrl(url, options);
  
  // Generate srcset for responsive images if width is specified
  const srcSet = options.width
    ? generateSrcSet(url, undefined, {
        quality: options.quality,
        format: options.format as 'auto' | 'webp' | 'avif' | 'jpg',
      })
    : undefined;

  return {
    src: optimized,
    srcSet,
    fallback: options.fallback || url,
  };
};

/**
 * Preload optimized image
 */
export const preloadOptimizedImage = (
  url: string,
  options: {
    width?: number;
    quality?: number;
    priority?: 'high' | 'low' | 'auto';
  } = {}
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const optimizedUrl = optimizeImageUrl(url, {
      width: options.width,
      quality: options.quality || 60,
      format: 'auto',
    });

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    
    if (options.priority === 'high') {
      img.fetchPriority = 'high';
    } else if (options.priority === 'low') {
      img.fetchPriority = 'low';
    }
    
    img.src = optimizedUrl;
  });
};

