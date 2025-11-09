/**
 * Icon utility - Lazy loads icons to reduce initial bundle size
 * This prevents loading the entire react-icons library upfront
 */

// Lazy load icon components to reduce initial bundle size
export const Icons = {
  // Common icons - loaded on demand
  FaArrowRight: () => import('react-icons/fa').then(m => m.FaArrowRight),
  FaBars: () => import('react-icons/fa').then(m => m.FaBars),
  FaTimes: () => import('react-icons/fa').then(m => m.FaTimes),
  FaWhatsapp: () => import('react-icons/fa').then(m => m.FaWhatsapp),
  FaEnvelope: () => import('react-icons/fa').then(m => m.FaEnvelope),
  FaCalendarAlt: () => import('react-icons/fa').then(m => m.FaCalendarAlt),
  FaMapMarkerAlt: () => import('react-icons/fa').then(m => m.FaMapMarkerAlt),
  FaInstagram: () => import('react-icons/fa').then(m => m.FaInstagram),
  FaTelegram: () => import('react-icons/fa').then(m => m.FaTelegram),
  FaTiktok: () => import('react-icons/fa').then(m => m.FaTiktok),
  FaYoutube: () => import('react-icons/fa').then(m => m.FaYoutube),
  FaFacebook: () => import('react-icons/fa').then(m => m.FaFacebook),
  FaLinkedin: () => import('react-icons/fa').then(m => m.FaLinkedin),
  FaTwitter: () => import('react-icons/fa').then(m => m.FaTwitter),
  FaSearch: () => import('react-icons/fa').then(m => m.FaSearch),
  FaUsers: () => import('react-icons/fa').then(m => m.FaUsers),
  FaSpinner: () => import('react-icons/fa').then(m => m.FaSpinner),
  FaCheckCircle: () => import('react-icons/fa').then(m => m.FaCheckCircle),
  FaTimesCircle: () => import('react-icons/fa').then(m => m.FaTimesCircle),
  FaDownload: () => import('react-icons/fa').then(m => m.FaDownload),
  FaChevronLeft: () => import('react-icons/fa').then(m => m.FaChevronLeft),
  FaChevronRight: () => import('react-icons/fa').then(m => m.FaChevronRight),
  FaEdit: () => import('react-icons/fa').then(m => m.FaEdit),
  FaTrash: () => import('react-icons/fa').then(m => m.FaTrash),
  FaPlus: () => import('react-icons/fa').then(m => m.FaPlus),
  FaUpload: () => import('react-icons/fa').then(m => m.FaUpload),
  FaSave: () => import('react-icons/fa').then(m => m.FaSave),
  FaQrcode: () => import('react-icons/fa').then(m => m.FaQrcode),
  FaExternalLinkAlt: () => import('react-icons/fa').then(m => m.FaExternalLinkAlt),
  FaSnowflake: () => import('react-icons/fa').then(m => m.FaSnowflake),
  FaSun: () => import('react-icons/fa').then(m => m.FaSun),
  FaTint: () => import('react-icons/fa').then(m => m.FaTint),
  FaTree: () => import('react-icons/fa').then(m => m.FaTree),
  FaWalking: () => import('react-icons/fa').then(m => m.FaWalking),
};

