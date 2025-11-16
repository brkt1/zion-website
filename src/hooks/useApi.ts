import useSWR from 'swr';
import { adminApi } from '../services/adminApi';
import { AboutContent, api, Category, ContactInfo, Destination, Event, GalleryItem, HomeContent, SiteConfig } from '../services/api';
import { CommissionSeller } from '../types';

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
      shouldRetryOnError: true,
      errorRetryCount: Infinity,
      errorRetryInterval: 3000,
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
      shouldRetryOnError: true,
      errorRetryCount: Infinity,
      errorRetryInterval: 3000,
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
      shouldRetryOnError: true,
      errorRetryCount: Infinity, // Keep retrying indefinitely
      errorRetryInterval: 3000, // Retry every 3 seconds
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
      shouldRetryOnError: true,
      errorRetryCount: Infinity,
      errorRetryInterval: 3000,
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

// Commission Sellers hook with caching (public - active sellers only)
export const useActiveCommissionSellers = () => {
  const { data, error, isLoading, mutate } = useSWR<CommissionSeller[]>(
    'active-commission-sellers',
    () => api.getActiveCommissionSellers(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Cache for 5 seconds to prevent duplicate requests
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 2000,
    }
  );

  return {
    sellers: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};

// Commission Sellers hook with caching (admin - all sellers)
export const useCommissionSellers = () => {
  const { data, error, isLoading, mutate } = useSWR<CommissionSeller[]>(
    'admin-commission-sellers',
    () => adminApi.commissionSellers.getAll(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Cache for 5 seconds to prevent duplicate requests
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 2000,
    }
  );

  return {
    sellers: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};

// Commission Seller by ID hook with caching
export const useCommissionSeller = (id: string | undefined) => {
  const { data, error, isLoading, mutate } = useSWR<CommissionSeller>(
    id ? `commission-seller-${id}` : null,
    () => id ? adminApi.commissionSellers.getById(id) : Promise.resolve(null as any),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      shouldRetryOnError: true,
      errorRetryCount: 2,
      errorRetryInterval: 2000,
    }
  );

  return {
    seller: data,
    isLoading,
    isError: error,
    mutate,
  };
};
