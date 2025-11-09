import { CommissionSeller } from '../types';
import { supabase } from './supabase';

// Types (keeping the same interfaces)
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
  allowed_commission_seller_ids?: string[]; // Array of commission seller IDs allowed to sell tickets for this event
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
  allowed_commission_seller_ids?: string[]; // Array of commission seller IDs allowed to sell tickets for this destination
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
  ceo?: {
    name: string;
    title: string;
    image?: string;
    bio: string;
    quote?: string;
    socialLinks?: Array<{
      platform: string;
      url: string;
      icon?: string;
    }>;
  };
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

// API Functions using Supabase
export const api = {
  // Events
  getEvents: async (params?: { category?: string; featured?: boolean; limit?: number }): Promise<Event[]> => {
    let query = supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (params?.category) {
      query = query.eq('category', params.category);
    }

    if (params?.featured) {
      query = query.eq('featured', true);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching events:', error);
      throw new Error(error.message);
    }

    // Transform database fields to match interface
    return (data || []).map((event: any) => ({
      id: event.id,
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
      image: event.image,
      description: event.description,
      attendees: event.attendees,
      maxAttendees: event.max_attendees,
      price: event.price,
      currency: event.currency,
      gallery: event.gallery || [],
      featured: event.featured,
      allowed_commission_seller_ids: event.allowed_commission_seller_ids ?? undefined,
    }));
  },

  getEvent: async (id: string): Promise<Event> => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching event:', error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('Event not found');
    }

    return {
      id: data.id,
      title: data.title,
      date: data.date,
      time: data.time,
      location: data.location,
      category: data.category,
      image: data.image,
      description: data.description,
      attendees: data.attendees,
      maxAttendees: data.max_attendees,
      price: data.price,
      currency: data.currency,
      gallery: data.gallery || [],
      featured: data.featured,
      allowed_commission_seller_ids: data.allowed_commission_seller_ids ?? undefined,
    };
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      throw new Error(error.message);
    }

    return (data || []).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      slug: cat.slug,
      icon: cat.icon,
    }));
  },

  // Destinations
  getDestinations: async (): Promise<Destination[]> => {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching destinations:', error);
      throw new Error(error.message);
    }

    return (data || []).map((dest: any) => ({
      id: dest.id,
      name: dest.name,
      location: dest.location,
      img: dest.img,
      featured: dest.featured,
      allowed_commission_seller_ids: dest.allowed_commission_seller_ids || [],
    }));
  },

  // Gallery
  getGalleryItems: async (): Promise<GalleryItem[]> => {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching gallery items:', error);
      throw new Error(error.message);
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      image: item.image,
      icon: item.icon,
      main: item.main,
      sub: item.sub,
      defaultColor: item.default_color,
      category: item.category,
    }));
  },

  // About Content
  getAboutContent: async (): Promise<AboutContent> => {
    // Fetch about content
    const { data: aboutDataArray, error: aboutError } = await supabase
      .from('about_content')
      .select('*')
      .limit(1);

    if (aboutError) {
      console.error('Error fetching about content:', aboutError);
      throw new Error(aboutError.message);
    }

    const aboutData = aboutDataArray && aboutDataArray.length > 0 ? aboutDataArray[0] : null;

    // Fetch values
    const { data: valuesData, error: valuesError } = await supabase
      .from('about_values')
      .select('*')
      .order('display_order', { ascending: true });

    if (valuesError) {
      console.error('Error fetching about values:', valuesError);
      // Don't throw, just use empty array
    }

    // Fetch milestones
    const { data: milestonesData, error: milestonesError } = await supabase
      .from('about_milestones')
      .select('*')
      .order('display_order', { ascending: true });

    if (milestonesError) {
      console.error('Error fetching about milestones:', milestonesError);
      // Don't throw, just use empty array
    }

    // Fetch CEO social links (table may not exist, handle gracefully)
    let ceoSocialData = null;
    try {
      const { data, error: ceoSocialError } = await supabase
        .from('ceo_social_links')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (!ceoSocialError) {
        ceoSocialData = data;
      } else if (ceoSocialError.code !== 'PGRST205') {
        // Only log if it's not a "table not found" error
        console.warn('Error fetching CEO social links:', ceoSocialError.message);
      }
    } catch (error) {
      // Silently handle missing table
      ceoSocialData = null;
    }

    const result: AboutContent = {
      story: {
        title: aboutData?.story_title || '',
        content: aboutData?.story_content || '',
      },
      values: (valuesData || []).map((v: any) => ({
        number: v.number,
        title: v.title,
        description: v.description,
      })),
      mission: {
        title: aboutData?.mission_title || '',
        content: aboutData?.mission_content || '',
      },
      vision: {
        title: aboutData?.vision_title || '',
        content: aboutData?.vision_content || '',
      },
      milestones: (milestonesData || []).map((m: any) => ({
        year: m.year,
        title: m.title,
        description: m.description,
      })),
    };

    // Add CEO data if it exists
    if (aboutData?.ceo_name || aboutData?.ceo_bio) {
      result.ceo = {
        name: aboutData.ceo_name || '',
        title: aboutData.ceo_title || '',
        image: aboutData.ceo_image || undefined,
        bio: aboutData.ceo_bio || '',
        quote: aboutData.ceo_quote || undefined,
        socialLinks: (ceoSocialData || []).map((link: any) => ({
          platform: link.platform,
          url: link.url,
          icon: link.icon,
        })),
      };
    }

    return result;
  },

  // Contact Info
  getContactInfo: async (): Promise<ContactInfo> => {
    // Fetch contact info
    const { data: contactDataArray, error: contactError } = await supabase
      .from('contact_info')
      .select('*')
      .limit(1);

    if (contactError) {
      console.error('Error fetching contact info:', contactError);
      throw new Error(contactError.message);
    }

    const contactData = contactDataArray && contactDataArray.length > 0 ? contactDataArray[0] : null;

    // Fetch social links
    const { data: socialData, error: socialError } = await supabase
      .from('social_links')
      .select('*')
      .order('display_order', { ascending: true });

    if (socialError) {
      console.error('Error fetching social links:', socialError);
      // Don't throw error for social links, just use empty array
    }

    return {
      email: contactData?.email || '',
      phone: contactData?.phone || '',
      phoneFormatted: contactData?.phone_formatted || contactData?.phone || '',
      location: contactData?.location || '',
      socialLinks: (socialData || []).map((link: any) => ({
        platform: link.platform,
        url: link.url,
        icon: link.icon,
      })),
    };
  },

  // Site Config
  getSiteConfig: async (): Promise<SiteConfig> => {
    // Fetch site config
    const { data: configDataArray, error: configError } = await supabase
      .from('site_config')
      .select('*')
      .limit(1);

    if (configError) {
      console.error('Error fetching site config:', configError);
      throw new Error(configError.message);
    }

    const configData = configDataArray && configDataArray.length > 0 ? configDataArray[0] : null;

    // Fetch navigation links
    const { data: navData, error: navError } = await supabase
      .from('navigation_links')
      .select('*')
      .order('display_order', { ascending: true });

    if (navError) {
      console.error('Error fetching navigation links:', navError);
      // Don't throw, just use empty array
    }

    return {
      siteName: configData?.site_name || 'YENEGE',
      logo: configData?.logo || '/logo.png',
      navigation: (navData || []).map((link: any) => ({
        path: link.path,
        label: link.label,
      })),
      footer: {
        description: configData?.footer_description || '',
        quickLinks: (navData || []).map((link: any) => ({
          path: link.path,
          label: link.label,
        })),
      },
    };
  },

  // Home Content
  getHomeContent: async (): Promise<HomeContent> => {
    // Fetch home content
    const { data: homeDataArray, error: homeError } = await supabase
      .from('home_content')
      .select('*')
      .limit(1);

    if (homeError) {
      console.error('Error fetching home content:', homeError);
      throw new Error(homeError.message);
    }

    const homeData = homeDataArray && homeDataArray.length > 0 ? homeDataArray[0] : null;

    // Fetch hero categories
    const { data: heroCategoriesData, error: heroCategoriesError } = await supabase
      .from('hero_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (heroCategoriesError) {
      console.error('Error fetching hero categories:', heroCategoriesError);
      // Don't throw, just use empty array
    }

    // Fetch home categories
    const { data: homeCategoriesData, error: homeCategoriesError } = await supabase
      .from('home_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (homeCategoriesError) {
      console.error('Error fetching home categories:', homeCategoriesError);
      // Don't throw, just use empty array
    }

    // Fetch CTA buttons
    const { data: ctaButtonsData, error: ctaButtonsError } = await supabase
      .from('home_cta_buttons')
      .select('*')
      .order('display_order', { ascending: true });

    if (ctaButtonsError) {
      console.error('Error fetching CTA buttons:', ctaButtonsError);
      // Don't throw, just use empty array
    }

    // Fetch featured events
    let featuredEvents: Event[] = [];
    try {
      featuredEvents = await api.getEvents({ featured: true, limit: 3 });
    } catch (error) {
      console.error('Error fetching featured events:', error);
      // Don't throw, just use empty array
    }

    return {
      hero: {
        slogan: homeData?.hero_slogan || '',
        intro: homeData?.hero_intro || '',
        categories: (heroCategoriesData || []).map((cat: any) => ({
          label: cat.label,
          path: cat.path,
        })),
      },
      categories: (homeCategoriesData || []).map((cat: any) => ({
        id: cat.id,
        title: cat.title,
        description: cat.description,
        link: cat.link,
        number: cat.number || '',
      })),
      featuredEvents,
      cta: {
        title: homeData?.cta_title || '',
        description: homeData?.cta_description || '',
        buttons: (ctaButtonsData || []).map((btn: any) => ({
          text: btn.text,
          link: btn.link,
          type: btn.type,
        })),
      },
    };
  },

  // Commission Sellers - Public access to active sellers for ticket purchase
  getActiveCommissionSellers: async (): Promise<CommissionSeller[]> => {
    const { data, error } = await supabase
      .from('commission_sellers')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active commission sellers:', error);
      // Return empty array instead of throwing to allow form to work without sellers
      return [];
    }

    return (data || []) as CommissionSeller[];
  },
};

export default api;
