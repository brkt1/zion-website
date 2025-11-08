import { AboutContent, Category, ContactInfo, Destination, Event, GalleryItem, HomeContent, SiteConfig } from './api';
import { supabase } from './supabase';

// Admin API functions for CRUD operations
export const adminApi = {
  // Events CRUD
  events: {
    create: async (event: Omit<Event, 'id'>) => {
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: event.title,
          date: event.date,
          time: event.time,
          location: event.location,
          category: event.category,
          image: event.image,
          description: event.description,
          attendees: event.attendees || 0,
          max_attendees: event.maxAttendees,
          price: event.price,
          currency: event.currency,
          featured: event.featured || false,
          gallery: event.gallery || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    update: async (id: string, event: Partial<Event>) => {
      const { data, error } = await supabase
        .from('events')
        .update({
          title: event.title,
          date: event.date,
          time: event.time,
          location: event.location,
          category: event.category,
          image: event.image,
          description: event.description,
          attendees: event.attendees,
          max_attendees: event.maxAttendees,
          price: event.price,
          currency: event.currency,
          featured: event.featured,
          gallery: event.gallery,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    },
  },

  // Categories CRUD
  categories: {
    create: async (category: Omit<Category, 'id'>) => {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: category.name,
          description: category.description,
          slug: category.slug,
          icon: category.icon,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    update: async (id: string, category: Partial<Category>) => {
      const { data, error } = await supabase
        .from('categories')
        .update({
          name: category.name,
          description: category.description,
          slug: category.slug,
          icon: category.icon,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    },
  },

  // Destinations CRUD
  destinations: {
    create: async (destination: Omit<Destination, 'id'>) => {
      const { data, error } = await supabase
        .from('destinations')
        .insert({
          name: destination.name,
          location: destination.location,
          img: destination.img,
          featured: destination.featured || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    update: async (id: string, destination: Partial<Destination>) => {
      const { data, error } = await supabase
        .from('destinations')
        .update({
          name: destination.name,
          location: destination.location,
          img: destination.img,
          featured: destination.featured,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('destinations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    },
  },

  // Gallery CRUD
  gallery: {
    create: async (item: Omit<GalleryItem, 'id'>) => {
      const { data, error } = await supabase
        .from('gallery')
        .insert({
          image: item.image,
          icon: item.icon,
          main: item.main,
          sub: item.sub,
          default_color: item.defaultColor,
          category: item.category,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    update: async (id: string, item: Partial<GalleryItem>) => {
      const { data, error } = await supabase
        .from('gallery')
        .update({
          image: item.image,
          icon: item.icon,
          main: item.main,
          sub: item.sub,
          default_color: item.defaultColor,
          category: item.category,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    },
  },

  // Contact Info CRUD
  contactInfo: {
    update: async (contactInfo: Partial<ContactInfo>) => {
      // Get existing contact info
      const { data: existing } = await supabase
        .from('contact_info')
        .select('*')
        .limit(1)
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from('contact_info')
          .update({
            email: contactInfo.email,
            phone: contactInfo.phone,
            phone_formatted: contactInfo.phoneFormatted,
            location: contactInfo.location,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('contact_info')
          .insert({
            email: contactInfo.email || '',
            phone: contactInfo.phone || '',
            phone_formatted: contactInfo.phoneFormatted,
            location: contactInfo.location || '',
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },

    updateSocialLinks: async (links: Array<{ platform: string; url: string }>) => {
      // Delete all existing links
      const { data: existing } = await supabase.from('social_links').select('id');
      if (existing && existing.length > 0) {
        await supabase.from('social_links').delete().in('id', existing.map(l => l.id));
      }

      // Insert new links
      const { data, error } = await supabase
        .from('social_links')
        .insert(links.map((link, index) => ({
          platform: link.platform,
          url: link.url,
          display_order: index + 1,
        })))
        .select();

      if (error) throw error;
      return data;
    },
  },

  // Site Config CRUD
  siteConfig: {
    update: async (config: Partial<SiteConfig>) => {
      const { data: existing } = await supabase
        .from('site_config')
        .select('*')
        .limit(1)
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from('site_config')
          .update({
            site_name: config.siteName,
            logo: config.logo,
            footer_description: config.footer?.description,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('site_config')
          .insert({
            site_name: config.siteName || 'YENEGE',
            logo: config.logo || '/logo.png',
            footer_description: config.footer?.description || '',
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },

    updateNavigation: async (links: Array<{ path: string; label: string }>) => {
      const { data: existing } = await supabase.from('navigation_links').select('id');
      if (existing && existing.length > 0) {
        await supabase.from('navigation_links').delete().in('id', existing.map(l => l.id));
      }

      const { data, error } = await supabase
        .from('navigation_links')
        .insert(links.map((link, index) => ({
          path: link.path,
          label: link.label,
          display_order: index + 1,
        })))
        .select();

      if (error) throw error;
      return data;
    },
  },

  // About Content CRUD
  aboutContent: {
    update: async (content: Partial<AboutContent>) => {
      const { data: existing } = await supabase
        .from('about_content')
        .select('*')
        .limit(1)
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from('about_content')
          .update({
            story_title: content.story?.title,
            story_content: content.story?.content,
            mission_title: content.mission?.title,
            mission_content: content.mission?.content,
            vision_title: content.vision?.title,
            vision_content: content.vision?.content,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('about_content')
          .insert({
            story_title: content.story?.title || '',
            story_content: content.story?.content || '',
            mission_title: content.mission?.title || '',
            mission_content: content.mission?.content || '',
            vision_title: content.vision?.title || '',
            vision_content: content.vision?.content || '',
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },

    updateValues: async (values: Array<{ number: string; title: string; description: string }>) => {
      const { data: existing } = await supabase.from('about_values').select('id');
      if (existing && existing.length > 0) {
        await supabase.from('about_values').delete().in('id', existing.map(v => v.id));
      }

      const { data, error } = await supabase
        .from('about_values')
        .insert(values.map((value, index) => ({
          number: value.number,
          title: value.title,
          description: value.description,
          display_order: index + 1,
        })))
        .select();

      if (error) throw error;
      return data;
    },

    updateMilestones: async (milestones: Array<{ year: string; title: string; description: string }>) => {
      const { data: existing } = await supabase.from('about_milestones').select('id');
      if (existing && existing.length > 0) {
        await supabase.from('about_milestones').delete().in('id', existing.map(m => m.id));
      }

      const { data, error } = await supabase
        .from('about_milestones')
        .insert(milestones.map((milestone, index) => ({
          year: milestone.year,
          title: milestone.title,
          description: milestone.description,
          display_order: index + 1,
        })))
        .select();

      if (error) throw error;
      return data;
    },

    updateCEO: async (ceo: { name: string; title: string; image?: string; bio: string; quote?: string; socialLinks?: Array<{ platform: string; url: string; icon?: string }> }) => {
      const { data: existing } = await supabase
        .from('about_content')
        .select('*')
        .limit(1)
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from('about_content')
          .update({
            ceo_name: ceo.name,
            ceo_title: ceo.title,
            ceo_image: ceo.image || null,
            ceo_bio: ceo.bio,
            ceo_quote: ceo.quote || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;

        // Update CEO social links
        if (ceo.socialLinks && ceo.socialLinks.length > 0) {
          const { data: existingLinks } = await supabase
            .from('ceo_social_links')
            .select('id');
          
          if (existingLinks && existingLinks.length > 0) {
            await supabase
              .from('ceo_social_links')
              .delete()
              .in('id', existingLinks.map(l => l.id));
          }

          const { error: linksError } = await supabase
            .from('ceo_social_links')
            .insert(ceo.socialLinks.map((link, index) => ({
              platform: link.platform,
              url: link.url,
              icon: link.icon || null,
              display_order: index + 1,
            })));

          if (linksError) throw linksError;
        }

        return data;
      } else {
        // Create new about_content entry if it doesn't exist
        const { data, error } = await supabase
          .from('about_content')
          .insert({
            story_title: '',
            story_content: '',
            mission_title: '',
            mission_content: '',
            vision_title: '',
            vision_content: '',
            ceo_name: ceo.name,
            ceo_title: ceo.title,
            ceo_image: ceo.image || null,
            ceo_bio: ceo.bio,
            ceo_quote: ceo.quote || null,
          })
          .select()
          .single();

        if (error) throw error;

        // Insert CEO social links
        if (ceo.socialLinks && ceo.socialLinks.length > 0) {
          const { error: linksError } = await supabase
            .from('ceo_social_links')
            .insert(ceo.socialLinks.map((link, index) => ({
              platform: link.platform,
              url: link.url,
              icon: link.icon || null,
              display_order: index + 1,
            })));

          if (linksError) throw linksError;
        }

        return data;
      }
    },
  },

  // Home Content CRUD
  homeContent: {
    update: async (content: Partial<HomeContent>) => {
      const { data: existing } = await supabase
        .from('home_content')
        .select('*')
        .limit(1)
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from('home_content')
          .update({
            hero_slogan: content.hero?.slogan,
            hero_intro: content.hero?.intro,
            cta_title: content.cta?.title,
            cta_description: content.cta?.description,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('home_content')
          .insert({
            hero_slogan: content.hero?.slogan || '',
            hero_intro: content.hero?.intro || '',
            cta_title: content.cta?.title || '',
            cta_description: content.cta?.description || '',
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },

    updateHeroCategories: async (categories: Array<{ label: string; path: string }>) => {
      const { data: existing } = await supabase.from('hero_categories').select('id');
      if (existing && existing.length > 0) {
        await supabase.from('hero_categories').delete().in('id', existing.map(c => c.id));
      }

      const { data, error } = await supabase
        .from('hero_categories')
        .insert(categories.map((cat, index) => ({
          label: cat.label,
          path: cat.path,
          display_order: index + 1,
        })))
        .select();

      if (error) throw error;
      return data;
    },

    updateHomeCategories: async (categories: Array<{ title: string; description: string; link: string; number: string }>) => {
      const { data: existing } = await supabase.from('home_categories').select('id');
      if (existing && existing.length > 0) {
        await supabase.from('home_categories').delete().in('id', existing.map(c => c.id));
      }

      const { data, error } = await supabase
        .from('home_categories')
        .insert(categories.map((cat, index) => ({
          title: cat.title,
          description: cat.description,
          link: cat.link,
          number: cat.number,
          display_order: index + 1,
        })))
        .select();

      if (error) throw error;
      return data;
    },

    updateCtaButtons: async (buttons: Array<{ text: string; link: string; type: 'primary' | 'secondary' }>) => {
      const { data: existing } = await supabase.from('home_cta_buttons').select('id');
      if (existing && existing.length > 0) {
        await supabase.from('home_cta_buttons').delete().in('id', existing.map(b => b.id));
      }

      const { data, error } = await supabase
        .from('home_cta_buttons')
        .insert(buttons.map((btn, index) => ({
          text: btn.text,
          link: btn.link,
          type: btn.type,
          display_order: index + 1,
        })))
        .select();

      if (error) throw error;
      return data;
    },
  },

  // Tickets - Get all tickets with buyer information
  tickets: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },

    getByStatus: async (status: 'pending' | 'success' | 'failed' | 'cancelled') => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },

    getByEvent: async (eventId: string) => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  },

  // Reminders - Manage call reminders for customers
  reminders: {
    create: async (reminderData: {
      ticket_id?: string;
      customer_email: string;
      customer_name?: string;
      customer_phone?: string;
      reminder_date: string;
      reminder_time?: string;
      notes?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('reminders')
        .insert([{
          ticket_id: reminderData.ticket_id || null,
          customer_email: reminderData.customer_email,
          customer_name: reminderData.customer_name || null,
          customer_phone: reminderData.customer_phone || null,
          reminder_date: reminderData.reminder_date,
          reminder_time: reminderData.reminder_time || null,
          notes: reminderData.notes || null,
          created_by: user?.id || null,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    getAll: async () => {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .order('reminder_date', { ascending: true });

      if (error) throw error;
      return data;
    },

    getByCustomer: async (customerEmail: string) => {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('customer_email', customerEmail)
        .order('reminder_date', { ascending: true });

      if (error) throw error;
      return data;
    },

    update: async (reminderId: string, updates: {
      reminder_date?: string;
      reminder_time?: string;
      notes?: string;
      status?: 'pending' | 'completed' | 'cancelled';
    }) => {
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      if (updates.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('reminders')
        .update(updateData)
        .eq('id', reminderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    delete: async (reminderId: string) => {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId);

      if (error) throw error;
    },
  },
};

