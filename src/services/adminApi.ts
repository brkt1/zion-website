import { Application, CommissionSeller, CreateApplicationData, CreateCommissionSellerData, CreateTicketScannerData, TicketScanner, UpdateApplicationData, UpdateCommissionSellerData, UpdateTicketScannerData } from '../types';
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
          allowed_commission_seller_ids: event.allowed_commission_seller_ids || [],
          social_media_link: event.social_media_link || null,
          telegram_link: event.telegram_link || null,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Send push notification about new event
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        await fetch(`${apiUrl}/push/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: '🎉 New Event Launched!',
            body: `${event.title} - Check it out now!`,
            image: event.image || undefined,
            url: `/events/${data.id}`,
            tag: `new-event-${data.id}`,
          }),
        });
      } catch (pushError) {
        // Don't fail event creation if push notification fails
        console.warn('Failed to send push notification for new event:', pushError);
      }
      
      // Announce event to Telegram groups
      // Note: This requires REACT_APP_TELEGRAM_ADMIN_API_TOKEN to be set in frontend env
      // The token is only accessible to authenticated admins, so this is secure
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const adminToken = process.env.REACT_APP_TELEGRAM_ADMIN_API_TOKEN;
        
        if (adminToken) {
          const response = await fetch(`${apiUrl}/telegram/announce-event`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${adminToken}`,
            },
            body: JSON.stringify({
              event: {
                id: data.id,
                title: data.title,
                date: data.date,
                time: data.time,
                location: data.location,
                category: data.category,
                image: data.image,
                description: data.description,
                price: data.price,
                currency: data.currency,
                telegram_link: data.telegram_link,
              },
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.warn('Telegram announcement failed:', errorData);
          }
        } else {
          console.warn('REACT_APP_TELEGRAM_ADMIN_API_TOKEN not set. Event announcement skipped.');
        }
      } catch (telegramError) {
        // Don't fail event creation if Telegram announcement fails
        console.warn('Failed to announce event to Telegram groups:', telegramError);
      }
      
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
          allowed_commission_seller_ids: event.allowed_commission_seller_ids !== undefined ? event.allowed_commission_seller_ids : undefined,
          social_media_link: event.social_media_link !== undefined ? event.social_media_link : undefined,
          telegram_link: event.telegram_link !== undefined ? event.telegram_link : undefined,
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
          allowed_commission_seller_ids: destination.allowed_commission_seller_ids || [],
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
          allowed_commission_seller_ids: destination.allowed_commission_seller_ids !== undefined ? destination.allowed_commission_seller_ids : undefined,
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

    getByCommissionSeller: async (commissionSellerId: string) => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('commission_seller_id', commissionSellerId)
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

  // Commission Sellers - Manage commission ticket sellers
  commissionSellers: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('commission_sellers')
        .select('*')
        .order('name', { ascending: true }); // Order by name for better UX

      if (error) throw error;
      return data as CommissionSeller[];
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('commission_sellers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as CommissionSeller;
    },

    getActive: async () => {
      const { data, error } = await supabase
        .from('commission_sellers')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true }); // Order by name for better UX

      if (error) throw error;
      return data as CommissionSeller[];
    },

    create: async (sellerData: CreateCommissionSellerData) => {
      const { data, error } = await supabase
        .from('commission_sellers')
        .insert([{
          name: sellerData.name,
          email: sellerData.email,
          phone: sellerData.phone || null,
          commission_rate: sellerData.commission_rate,
          commission_type: sellerData.commission_type,
          discount_rate: sellerData.discount_rate !== undefined ? sellerData.discount_rate : null,
          discount_type: sellerData.discount_type || null,
          is_active: sellerData.is_active !== undefined ? sellerData.is_active : true,
          notes: sellerData.notes || null,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as CommissionSeller;
    },

    update: async (id: string, sellerData: UpdateCommissionSellerData) => {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (sellerData.name !== undefined) updateData.name = sellerData.name;
      if (sellerData.email !== undefined) updateData.email = sellerData.email;
      if (sellerData.phone !== undefined) updateData.phone = sellerData.phone || null;
      if (sellerData.commission_rate !== undefined) updateData.commission_rate = sellerData.commission_rate;
      if (sellerData.commission_type !== undefined) updateData.commission_type = sellerData.commission_type;
      if (sellerData.discount_rate !== undefined) updateData.discount_rate = sellerData.discount_rate !== null && sellerData.discount_rate !== undefined ? sellerData.discount_rate : null;
      if (sellerData.discount_type !== undefined) updateData.discount_type = sellerData.discount_type || null;
      if (sellerData.is_active !== undefined) updateData.is_active = sellerData.is_active;
      if (sellerData.notes !== undefined) updateData.notes = sellerData.notes || null;

      const { data, error } = await supabase
        .from('commission_sellers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as CommissionSeller;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('commission_sellers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    },
  },

  // Ticket Scanners - Manage ticket scanners
  ticketScanners: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('ticket_scanners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TicketScanner[];
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('ticket_scanners')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as TicketScanner;
    },

    getActive: async () => {
      const { data, error } = await supabase
        .from('ticket_scanners')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TicketScanner[];
    },

    create: async (scannerData: CreateTicketScannerData) => {
      const { data, error } = await supabase
        .from('ticket_scanners')
        .insert([{
          name: scannerData.name,
          email: scannerData.email,
          phone: scannerData.phone || null,
          is_active: scannerData.is_active !== undefined ? scannerData.is_active : true,
          notes: scannerData.notes || null,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as TicketScanner;
    },

    update: async (id: string, scannerData: UpdateTicketScannerData) => {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (scannerData.name !== undefined) updateData.name = scannerData.name;
      if (scannerData.email !== undefined) updateData.email = scannerData.email;
      if (scannerData.phone !== undefined) updateData.phone = scannerData.phone || null;
      if (scannerData.is_active !== undefined) updateData.is_active = scannerData.is_active;
      if (scannerData.notes !== undefined) updateData.notes = scannerData.notes || null;

      const { data, error } = await supabase
        .from('ticket_scanners')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as TicketScanner;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('ticket_scanners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    },
  },

  // Applications - Manage internship/volunteer applications
  applications: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Application[];
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Application;
    },

    create: async (applicationData: CreateApplicationData) => {
      const { data, error } = await supabase
        .from('applications')
        .insert([{
          name: applicationData.name,
          email: applicationData.email,
          phone: applicationData.phone,
          type: applicationData.type,
          position: applicationData.position || null,
          experience: applicationData.experience || null,
          motivation: applicationData.motivation,
          availability: applicationData.availability || null,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as Application;
    },

    update: async (id: string, applicationData: UpdateApplicationData) => {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (applicationData.status !== undefined) updateData.status = applicationData.status;
      if (applicationData.notes !== undefined) updateData.notes = applicationData.notes || null;

      const { data, error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Application;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    },
  },
};

