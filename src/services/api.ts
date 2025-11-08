const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Generic API fetch function
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Types
export interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  location: string;
  category: "game" | "travel" | "corporate" | "community";
  image: string;
  description: string;
  attendees?: number;
  maxAttendees?: number;
  price: string;
  currency: string;
  gallery?: string[];
  featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon?: string;
}

export interface Destination {
  id: string;
  name: string;
  location: string;
  img: string;
  featured?: boolean;
}

export interface GalleryItem {
  id: string;
  image: string;
  icon?: string;
  main: string;
  sub: string;
  defaultColor: string;
  category?: string;
}

export interface AboutContent {
  story: {
    title: string;
    content: string;
  };
  values: Array<{
    number: string;
    title: string;
    description: string;
  }>;
  mission: {
    title: string;
    content: string;
  };
  vision: {
    title: string;
    content: string;
  };
  milestones: Array<{
    year: string;
    title: string;
    description: string;
  }>;
}

export interface ContactInfo {
  email: string;
  phone: string;
  phoneFormatted: string;
  location: string;
  socialLinks: Array<{
    platform: string;
    url: string;
    icon?: string;
  }>;
}

export interface SiteConfig {
  siteName: string;
  logo: string;
  navigation: Array<{
    path: string;
    label: string;
  }>;
  footer: {
    description: string;
    quickLinks: Array<{
      path: string;
      label: string;
    }>;
  };
}

export interface HomeContent {
  hero: {
    slogan: string;
    intro: string;
    categories: Array<{
      label: string;
      path: string;
    }>;
  };
  categories: Array<{
    id: string;
    title: string;
    description: string;
    link: string;
    number: string;
  }>;
  featuredEvents: Event[];
  cta: {
    title: string;
    description: string;
    buttons: Array<{
      text: string;
      link: string;
      type: 'primary' | 'secondary';
    }>;
  };
}

// API Functions
export const api = {
  // Events
  getEvents: (params?: { category?: string; featured?: boolean; limit?: number }): Promise<Event[]> => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.featured) queryParams.append('featured', 'true');
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const query = queryParams.toString();
    return apiFetch<Event[]>(`/events${query ? `?${query}` : ''}`);
  },

  getEvent: (id: string): Promise<Event> => {
    return apiFetch<Event>(`/events/${id}`);
  },

  // Categories
  getCategories: (): Promise<Category[]> => {
    return apiFetch<Category[]>('/categories');
  },

  // Destinations (for Hero)
  getDestinations: (): Promise<Destination[]> => {
    return apiFetch<Destination[]>('/destinations');
  },

  // Gallery
  getGalleryItems: (): Promise<GalleryItem[]> => {
    return apiFetch<GalleryItem[]>('/gallery');
  },

  // About Page Content
  getAboutContent: (): Promise<AboutContent> => {
    return apiFetch<AboutContent>('/content/about');
  },

  // Contact Info
  getContactInfo: (): Promise<ContactInfo> => {
    return apiFetch<ContactInfo>('/content/contact');
  },

  // Site Configuration
  getSiteConfig: (): Promise<SiteConfig> => {
    return apiFetch<SiteConfig>('/config');
  },

  // Home Page Content
  getHomeContent: (): Promise<HomeContent> => {
    return apiFetch<HomeContent>('/content/home');
  },
};

export default api;

