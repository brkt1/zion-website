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

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline transition-colors ${className}`}
      title={`View location on Google Maps`}
    >
      {showIcon && <FaMapMarkerAlt className="text-red-500" size={14} />}
      <span>{displayText}</span>
      <FaExternalLinkAlt size={10} className="opacity-70" />
    </button>
  );
};

