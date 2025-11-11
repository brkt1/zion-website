import { FaExternalLinkAlt, FaMapMarkerAlt } from 'react-icons/fa';

interface LocationButtonProps {
  location: string;
  className?: string;
  showIcon?: boolean;
}

export const LocationButton = ({ location, className = '', showIcon = true }: LocationButtonProps) => {
  // Check if location is already a Google Maps URL (including share links)
  const isGoogleMapsUrl = 
    location.includes('maps.google.com') || 
    location.includes('goo.gl/maps') || 
    location.includes('maps.app.goo.gl') ||
    location.includes('share.google.com') ||
    location.startsWith('http://') ||
    location.startsWith('https://');
  
  // Extract readable location name from URL or use the location as-is
  const getDisplayText = () => {
    if (isGoogleMapsUrl) {
      // Try to extract location name from URL
      try {
        const url = new URL(location);
        // Check for query parameters that might contain location name
        const query = url.searchParams.get('q') || url.searchParams.get('query');
        if (query) {
          return decodeURIComponent(query);
        }
        // For share.google.com links, show a generic text
        if (location.includes('share.google.com')) {
          return 'View Location on Google Maps';
        }
        // For other Google Maps URLs, show generic text
        return 'View on Google Maps';
      } catch {
        // If URL parsing fails, show generic text
        return 'View Location on Google Maps';
      }
    }
    // For regular location names, show as-is
    return location;
  };
  
  // If it's already a URL, use it directly
  // Otherwise, create a Google Maps search URL
  const getMapsUrl = () => {
    if (isGoogleMapsUrl) {
      return location;
    }
    // Create Google Maps search URL
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  };

  const handleClick = () => {
    window.open(getMapsUrl(), '_blank', 'noopener,noreferrer');
  };

  const displayText = getDisplayText();

  // Check if className overrides default padding/sizing
  const hasCustomPadding = className.includes('!p-0') || className.includes('p-0');
  const hasCustomMinSize = className.includes('!min-h-0') || className.includes('min-h-0');
  
  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline transition-colors ${className}`}
      style={{ 
        minHeight: hasCustomMinSize ? undefined : '44px', 
        minWidth: hasCustomMinSize ? undefined : '44px', 
        padding: hasCustomPadding ? undefined : '8px 12px',
        display: 'inline-flex',
        alignItems: 'center',
        boxSizing: 'border-box'
      }}
      title={`View location on Google Maps`}
      aria-label={`View location on Google Maps: ${displayText}`}
    >
      {showIcon && <FaMapMarkerAlt className="text-red-500 flex-shrink-0" size={14} aria-hidden="true" />}
      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayText}</span>
      <FaExternalLinkAlt size={10} className="opacity-70 flex-shrink-0" aria-hidden="true" />
    </button>
  );
};

