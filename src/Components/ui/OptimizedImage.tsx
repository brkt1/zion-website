import { ImgHTMLAttributes, useEffect, useState } from 'react';
import { generateSrcSet, optimizeImageUrl } from '../../utils/imageOptimizer';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  priority?: 'high' | 'low' | 'auto';
  responsive?: boolean;
  sizes?: string;
  fallback?: string;
}

/**
 * OptimizedImage component that automatically optimizes images
 * - Converts to WebP/AVIF when supported
 * - Creates responsive srcset
 * - Lazy loads by default
 * - Handles errors gracefully
 */
export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  quality = 60,
  priority = 'auto',
  responsive = true,
  sizes,
  fallback,
  className,
  loading,
  ...props
}: OptimizedImageProps) => {
  // Start with original src - local images will stay as-is, external will be optimized
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [imageSrcSet, setImageSrcSet] = useState<string | undefined>();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) return;

    // For local images, use original src directly without any optimization
    const isLocalImage = src.startsWith('/') || src.startsWith('./') || src.startsWith('../');
    
    if (isLocalImage) {
      // For local images, always use the original path directly - no optimization
      setImageSrc(src);
      setImageSrcSet(undefined);
      return;
    }
    
    // Only optimize external URLs
    try {
      // Optimize the image URL
      const optimized = optimizeImageUrl(src, {
        width,
        height,
        quality,
        format: 'auto',
      });
      
      if (optimized !== src) {
        // Try optimized version
        setImageSrc(optimized);
        
        // Generate responsive srcset if enabled
        if (responsive && width) {
          const srcSet = generateSrcSet(src, undefined, { quality, format: 'auto' });
          setImageSrcSet(srcSet);
        }
      } else {
        // Keep original
        setImageSrc(src);
      }
    } catch (error) {
      console.warn('Image optimization failed, using original:', error);
      // Keep original src if optimization fails
      setImageSrc(src);
      setImageSrcSet(undefined);
    }
  }, [src, width, height, quality, responsive]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      // For local images, immediately fall back to original path
      if (src.startsWith('/') || src.startsWith('./')) {
        setImageSrc(src);
        setImageSrcSet(undefined);
        return;
      }
      
      // Try fallback or original URL
      if (fallback) {
        // For local fallback, use as-is; for external, try to optimize
        const optimizedFallback = fallback.startsWith('http') && !fallback.includes('images.weserv.nl')
          ? optimizeImageUrl(fallback, { width, height, quality, format: 'auto' })
          : fallback;
        setImageSrc(optimizedFallback);
      } else {
        // Fall back to original src
        setImageSrc(src);
        setImageSrcSet(undefined);
      }
    }
  };

  // Determine loading strategy
  const loadingStrategy = loading || (priority === 'high' ? 'eager' : 'lazy');
  const fetchPriority = priority === 'high' ? 'high' : priority === 'low' ? 'low' : undefined;
  
  // Only use crossOrigin for external URLs (not local images)
  const isLocalImage = src.startsWith('/') || src.startsWith('./') || src.startsWith('../');
  const shouldUseCrossOrigin = !isLocalImage && (imageSrc.startsWith('http') || imageSrc.includes('images.weserv.nl'));

  return (
    <img
      src={imageSrc}
      srcSet={imageSrcSet}
      sizes={sizes || (responsive && width ? `(max-width: ${width}px) 100vw, ${width}px` : undefined)}
      alt={alt}
      width={width}
      height={height}
      loading={loadingStrategy}
      fetchPriority={fetchPriority}
      className={className}
      onError={handleError}
      decoding="async"
      {...(shouldUseCrossOrigin ? { crossOrigin: 'anonymous' } : {})}
      {...props}
    />
  );
};

export default OptimizedImage;

