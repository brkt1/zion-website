import { FaExternalLinkAlt, FaMapMarkerAlt } from 'react-icons/fa';

interface LocationButtonProps {
  location: string;
  className?: string;
  showIcon?: boolean;
}

export const LocationButton = ({ location, className = '', showIcon = true }: LocationButtonProps) => {
  // Check if location is already a Google Maps URL
  const isGoogleMapsUrl = location.includes('maps.google.com') || location.includes('goo.gl/maps') || location.includes('maps.app.goo.gl');
  
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

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline transition-colors ${className}`}
      title={`View ${location} on Google Maps`}
    >
      {showIcon && <FaMapMarkerAlt className="text-red-500" size={14} />}
      <span>{location}</span>
      <FaExternalLinkAlt size={10} className="opacity-70" />
    </button>
  );
};

