import { CommissionSeller, CreateFeasibilityBriefData } from '../types';
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
  social_media_link?: string; // Social media link for community/free events
  telegram_link?: string; // Telegram group link for free events
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
    details?: Array<{ label: string; value: string }>;
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
    // Get today's date in YYYY-MM-DD format for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    let query = supabase
      .from('events')
      .select('*')
      .gte('date', todayStr) // Only get events from today onwards
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
      social_media_link: event.social_media_link ?? undefined,
      telegram_link: event.telegram_link ?? undefined,
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
      social_media_link: data.social_media_link ?? undefined,
      telegram_link: data.telegram_link ?? undefined,
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

  getAboutContent: async (): Promise<AboutContent> => {
    // Fetch all content in parallel
    const [aboutRes, valuesRes, milestonesRes] = await Promise.all([
      supabase.from('about_content').select('*').limit(1),
      supabase.from('about_values').select('*').order('display_order', { ascending: true }),
      supabase.from('about_milestones').select('*').order('display_order', { ascending: true })
    ]);

    if (aboutRes.error) {
      console.error('Error fetching about content:', aboutRes.error);
      throw new Error(aboutRes.error.message);
    }

    if (valuesRes.error) console.error('Error fetching about values:', valuesRes.error);
    if (milestonesRes.error) console.error('Error fetching about milestones:', milestonesRes.error);

    const aboutData = aboutRes.data && aboutRes.data.length > 0 ? aboutRes.data[0] : null;

    let ceoSocialRes: any = { data: [], error: null };
    // Safe fetch for CEO social links only if CEO data is configured (prevents 404 on missing table)
    if (aboutData?.ceo_name || aboutData?.ceo_bio) {
      ceoSocialRes = await supabase.from('ceo_social_links').select('*').order('display_order', { ascending: true });
      if (ceoSocialRes.error && ceoSocialRes.error.code !== 'PGRST205') {
        console.warn('Error fetching CEO social links:', ceoSocialRes.error.message);
      }
    }

    const result: AboutContent = {
      story: {
        title: aboutData?.story_title || '',
        content: aboutData?.story_content || '',
      },
      values: (valuesRes.data || []).map((v: any) => ({
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
      milestones: (milestonesRes.data || []).map((m: any) => ({
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
        socialLinks: (ceoSocialRes.data || []).map((link: any) => ({
          platform: link.platform,
          url: link.url,
          icon: link.icon,
        })),
        details: [
          { label: "Founder", value: aboutData.ceo_name || 'Bereket Yosef' },
          { label: "Headquarters", value: "Addis Ababa, Ethiopia" },
          { label: "Founded", value: "2019" },
          { label: "Expertise", value: "Event Architecture & Strategy" }
        ]
      };
    }

    return result;
  },

  // Contact Info
  getContactInfo: async (): Promise<ContactInfo> => {
    // Fetch all content in parallel
    const [contactRes, socialRes] = await Promise.all([
      supabase.from('contact_info').select('*').limit(1),
      supabase.from('social_links').select('*').order('display_order', { ascending: true })
    ]);

    if (contactRes.error) {
      console.error('Error fetching contact info:', contactRes.error);
      throw new Error(contactRes.error.message);
    }

    if (socialRes.error) {
      console.error('Error fetching social links:', socialRes.error);
    }

    const contactData = contactRes.data && contactRes.data.length > 0 ? contactRes.data[0] : null;

    return {
      email: contactData?.email || '',
      phone: contactData?.phone || '',
      phoneFormatted: contactData?.phone_formatted || contactData?.phone || '',
      location: contactData?.location || '',
      socialLinks: (socialRes.data || []).map((link: any) => ({
        platform: link.platform,
        url: link.url,
        icon: link.icon,
      })),
    };
  },

  // Site Config
  getSiteConfig: async (): Promise<SiteConfig> => {
    const [configRes, navRes] = await Promise.all([
      supabase.from('site_config').select('*').limit(1),
      supabase.from('navigation_links').select('*').order('display_order', { ascending: true })
    ]);

    if (configRes.error) {
      console.error('Error fetching site config:', configRes.error);
      throw new Error(configRes.error.message);
    }

    if (navRes.error) {
      console.error('Error fetching navigation links:', navRes.error);
    }

    const configData = configRes.data && configRes.data.length > 0 ? configRes.data[0] : null;

    return {
      siteName: configData?.site_name || 'YENEGE',
      logo: configData?.logo || '/logo.png',
      navigation: (navRes.data || []).map((link: any) => ({
        path: link.path,
        label: link.label,
      })),
      footer: {
        description: configData?.footer_description || '',
        quickLinks: (navRes.data || []).map((link: any) => ({
          path: link.path,
          label: link.label,
        })),
      },
    };
  },

  // Home Content
  getHomeContent: async (): Promise<HomeContent> => {
    // Fetch all content in parallel
    const [
      homeRes, 
      heroCategoriesRes, 
      homeCategoriesRes, 
      ctaButtonsRes, 
      featuredEventsRes
    ] = await Promise.all([
      supabase.from('home_content').select('*').limit(1),
      supabase.from('hero_categories').select('*').order('display_order', { ascending: true }),
      supabase.from('home_categories').select('*').order('display_order', { ascending: true }),
      supabase.from('home_cta_buttons').select('*').order('display_order', { ascending: true }),
      api.getEvents({ featured: true, limit: 3 }).catch(err => {
        console.error('Error fetching featured events:', err);
        return [];
      })
    ]);

    if (homeRes.error) {
      console.error('Error fetching home content:', homeRes.error);
      throw new Error(homeRes.error.message);
    }

    if (heroCategoriesRes.error) console.error('Error fetching hero categories:', heroCategoriesRes.error);
    if (homeCategoriesRes.error) console.error('Error fetching home categories:', homeCategoriesRes.error);
    if (ctaButtonsRes.error) console.error('Error fetching CTA buttons:', ctaButtonsRes.error);

    const homeData = homeRes.data && homeRes.data.length > 0 ? homeRes.data[0] : null;

    return {
      hero: {
        slogan: homeData?.hero_slogan || '',
        intro: homeData?.hero_intro || '',
        categories: (heroCategoriesRes.data || []).map((cat: any) => ({
          label: cat.label,
          path: cat.path,
        })),
      },
      categories: (homeCategoriesRes.data || []).map((cat: any) => ({
        id: cat.id,
        title: cat.title,
        description: cat.description,
        link: cat.link,
        number: cat.number || '',
      })),
      featuredEvents: featuredEventsRes as Event[],
      cta: {
        title: homeData?.cta_title || '',
        description: homeData?.cta_description || '',
        buttons: (ctaButtonsRes.data || []).map((btn: any) => ({
          text: btn.text,
          link: btn.link,
          type: btn.type,
        })),
      },
    };
  },

  // Commission Sellers - Public access to active sellers for ticket purchase
  // Optimized: Only select columns needed for ticket purchase form
  getActiveCommissionSellers: async (): Promise<CommissionSeller[]> => {
    const { data, error } = await supabase
      .from('commission_sellers')
      .select('id, name, email, phone, commission_rate, commission_type, discount_rate, discount_type, is_active, created_at')
      .eq('is_active', true)
      .order('name', { ascending: true }); // Order by name for better UX

    if (error) {
      console.error('Error fetching active commission sellers:', error);
      // Return empty array instead of throwing to allow form to work without sellers
      return [];
    }


    return (data || []) as CommissionSeller[];
  },

  // Feasibility Briefs
  submitFeasibilityBrief: async (brief: CreateFeasibilityBriefData) => {
    const { data, error } = await supabase
      .from('feasibility_briefs')
      .insert([{
        ...brief,
        status: 'pending'
      }]);

    if (error) {
      console.error('Error submitting feasibility brief:', error);
      throw new Error(error.message);
    }

    return data;
  },
};

export default api;
