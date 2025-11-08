import useSWR from 'swr';
import { AboutContent, api, Category, ContactInfo, Destination, Event, GalleryItem, HomeContent, SiteConfig } from '../services/api';

// Custom hooks for data fetching using SWR
export const useEvents = (params?: { category?: string; featured?: boolean; limit?: number }) => {
  const key = params 
    ? `events-${params.category || 'all'}-${params.featured || false}-${params.limit || 'all'}`
    : 'events-all';
  
  const { data, error, isLoading, mutate } = useSWR<Event[]>(
    key,
    () => api.getEvents(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    events: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};

export const useEvent = (id: string | undefined) => {
  const { data, error, isLoading, mutate } = useSWR<Event>(
    id ? `event-${id}` : null,
    () => id ? api.getEvent(id) : Promise.resolve(null as any),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    event: data,
    isLoading,
    isError: error,
    mutate,
  };
};

export const useCategories = () => {
  const { data, error, isLoading, mutate } = useSWR<Category[]>(
    'categories',
    () => api.getCategories(),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    categories: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};

export const useDestinations = () => {
  const { data, error, isLoading, mutate } = useSWR<Destination[]>(
    'destinations',
    () => api.getDestinations(),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    destinations: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};

export const useGalleryItems = () => {
  const { data, error, isLoading, mutate } = useSWR<GalleryItem[]>(
    'gallery',
    () => api.getGalleryItems(),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    galleryItems: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};

export const useAboutContent = () => {
  const { data, error, isLoading, mutate } = useSWR<AboutContent>(
    'about-content',
    () => api.getAboutContent(),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    content: data,
    isLoading,
    isError: error,
    mutate,
  };
};

export const useContactInfo = () => {
  const { data, error, isLoading, mutate } = useSWR<ContactInfo>(
    'contact-info',
    () => api.getContactInfo(),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    contactInfo: data,
    isLoading,
    isError: error,
    mutate,
  };
};

export const useSiteConfig = () => {
  const { data, error, isLoading, mutate } = useSWR<SiteConfig>(
    'site-config',
    () => api.getSiteConfig(),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    config: data,
    isLoading,
    isError: error,
    mutate,
  };
};

export const useHomeContent = () => {
  const { data, error, isLoading, mutate } = useSWR<HomeContent>(
    'home-content',
    () => api.getHomeContent(),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    content: data,
    isLoading,
    isError: error,
    mutate,
  };
};
