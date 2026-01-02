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

    // Get learning progress for an applicant by email
    getLearningProgress: async (email: string) => {
      try {
        const normalizedEmail = email.toLowerCase().trim();

        // Try using RPC function first (recommended approach)
        const { data: progressData, error: rpcError } = await supabase
          .rpc('get_learning_progress_by_email', { check_email: normalizedEmail });

        // If RPC function works (no error)
        // - Empty array = user doesn't exist
        // - Array with null lesson_id = user exists but no progress
        // - Array with lesson data = user exists and has progress
        if (!rpcError) {
          // Filter out marker rows (where lesson_id is null) for stats calculation
          const validProgress = (progressData || []).filter((p: any) => p.lesson_id !== null);
          
          // CRITICAL: If student has ANY progress entries, they MUST have an account
          // Check both: raw progressData (for marker rows with user_id) OR validProgress (actual lessons)
          // If we have any valid progress entries, user definitely has account
          const hasAccountFromProgress = validProgress.length > 0;
          const hasAccountFromMarker = progressData && progressData.length > 0 && progressData[0]?.user_id !== null;
          
          // User has account if they have progress OR if RPC returned a marker row with user_id
          const hasAccount = hasAccountFromProgress || hasAccountFromMarker;
          
          const totalLessons = validProgress.length;
          const completedLessons = validProgress.filter((p: any) => p.completed).length;
          const viewedLessons = validProgress.filter((p: any) => p.viewed).length;
          const completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
          const viewPercentage = totalLessons > 0 ? Math.round((viewedLessons / totalLessons) * 100) : 0;

          return {
            hasAccount,
            progress: validProgress, // Return only valid progress, not marker rows
            stats: {
              totalLessons,
              completedLessons,
              viewedLessons,
              completionPercentage,
              viewPercentage,
            },
          };
        }

        // If RPC function doesn't exist, try fallback approach
        if (rpcError && (rpcError.code === '42883' || rpcError.message?.includes('function') || rpcError.message?.includes('does not exist'))) {
          console.warn('RPC function get_learning_progress_by_email not available. Please run docs/scripts/get-learning-progress-by-email.sql');
          
          // Fallback: We can't easily query auth.users from client, so we'll need the RPC function
          // For now, return that the function is required
          return {
            hasAccount: false,
            progress: [],
            stats: {
              totalLessons: 0,
              completedLessons: 0,
              viewedLessons: 0,
              completionPercentage: 0,
              viewPercentage: 0,
            },
            error: 'RPC function required',
          };
        }

        // Other RPC errors (like permission denied)
        console.error('RPC function error:', rpcError);
        throw rpcError;
      } catch (error: any) {
        console.error('Error fetching learning progress:', error);
        // Return empty progress on error
        return {
          hasAccount: false,
          progress: [],
          stats: {
            totalLessons: 0,
            completedLessons: 0,
            viewedLessons: 0,
            completionPercentage: 0,
            viewPercentage: 0,
          },
        };
      }
    },

    // Get all accepted students with their course progress
    getAllAcceptedStudents: async () => {
      try {
        // Get all accepted internship applications
        const { data: applications, error: appsError } = await supabase
          .from('applications')
          .select('*')
          .eq('status', 'accepted')
          .eq('type', 'internship')
          .order('created_at', { ascending: false });

        if (appsError) throw appsError;

        // For each application, get learning progress and course info
        const studentsWithProgress = await Promise.all(
          (applications || []).map(async (app) => {
            try {
              const progress = await adminApi.applications.getLearningProgress(app.email);
              const accountInfo = await adminApi.applications.getUserAccountInfo(app.email);
              
              return {
                ...app,
                learningProgress: progress,
                accountInfo: accountInfo,
              };
            } catch (error) {
              console.error(`Error loading progress for ${app.email}:`, error);
              return {
                ...app,
                learningProgress: {
                  hasAccount: false,
                  progress: [],
                  stats: {
                    totalLessons: 0,
                    completedLessons: 0,
                    viewedLessons: 0,
                    completionPercentage: 0,
                    viewPercentage: 0,
                  },
                },
                accountInfo: {
                  email: app.email,
                  has_account: false,
                  user_id: null,
                  account_created_at: null,
                },
              };
            }
          })
        );

        return studentsWithProgress;
      } catch (error: any) {
        console.error('Error fetching accepted students:', error);
        throw error;
      }
    },

    // Get full user account information by email (for admin)
    getUserAccountInfo: async (email: string) => {
      try {
        const normalizedEmail = email.toLowerCase().trim();
        
        // Try to get user info using RPC function if available
        // Otherwise, use learning progress function which includes user_id
        const progressData = await adminApi.applications.getLearningProgress(email);
        
        // CRITICAL LOGIC: If student has ANY learning progress, they MUST have an account
        // You cannot have progress without an account - the e-learning portal requires authentication
        const hasProgressEntries = progressData.progress && progressData.progress.length > 0;
        const hasAccount = progressData.hasAccount || hasProgressEntries;
        
        // If user has account OR has any progress entries (they MUST have an account if they have progress)
        if (hasAccount || hasProgressEntries) {
          // Try to get user_id from progress data
          // If they have progress, they MUST have a user_id in the progress entries
          let userId = null;
          
          if (progressData.progress && progressData.progress.length > 0) {
            // Get user_id from first progress entry - all entries have same user_id
            userId = progressData.progress[0]?.user_id;
          }
          
          // If we don't have userId from progress, try RPC function directly
          if (!userId) {
            try {
              // Try to get user info via RPC function
              const { data: progressFromRpc, error: rpcError } = await supabase
                .rpc('get_learning_progress_by_email', { check_email: normalizedEmail });
              
              if (!rpcError && progressFromRpc && progressFromRpc.length > 0) {
                userId = progressFromRpc[0]?.user_id;
              }
            } catch (error) {
              console.log('Could not get user_id from RPC');
            }
          }
          
          // Try to get user metadata if RPC function exists
          if (userId) {
            try {
              const { data: userData, error: rpcError } = await supabase
                .rpc('get_user_info_by_email', { check_email: normalizedEmail });
              
              if (!rpcError && userData) {
                return {
                  ...userData,
                  has_account: true,
                };
              }
            } catch (error) {
              // RPC function might not exist, that's okay
              console.log('RPC function get_user_info_by_email not available');
            }
            
            // Return basic info with has_account = true since progressData.hasAccount is true
            return {
              user_id: userId,
              email: normalizedEmail,
              has_account: true, // User definitely has account if hasAccount is true
              account_created_at: null, // Will need RPC function for this
            };
          }
          
          // Even if we don't have userId, if they have progress, they MUST have an account
          return {
            email: normalizedEmail,
            has_account: true, // If they have progress, they have an account
            user_id: userId || null,
            account_created_at: null,
          };
        }
        
        // User doesn't have account - only return false if they truly have no progress AND no account flag
        // If they have any progress entries, they MUST have an account
        if (hasProgressEntries) {
          return {
            email: normalizedEmail,
            has_account: true, // Progress exists = account exists
            user_id: progressData.progress[0]?.user_id || null,
            account_created_at: null,
          };
        }
        
        // User doesn't have account and no progress
        return {
          email: normalizedEmail,
          has_account: false,
          user_id: null,
          account_created_at: null,
        };
      } catch (error: any) {
        console.error('Error fetching user account info:', error);
        return {
          email: email.toLowerCase().trim(),
          has_account: false,
          user_id: null,
          account_created_at: null,
        };
      }
    },
  },

  // Courses CRUD
  courses: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },

    create: async (course: { title: string; description?: string; is_active?: boolean; display_order?: number }) => {
      const { data, error } = await supabase
        .from('courses')
        .insert({
          title: course.title,
          description: course.description || null,
          is_active: course.is_active !== undefined ? course.is_active : true,
          display_order: course.display_order || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    update: async (id: string, updates: { title?: string; description?: string; is_active?: boolean; display_order?: number }) => {
      const { data, error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    },
  },

  // Course Weeks CRUD
  courseWeeks: {
    getByCourseId: async (courseId: string) => {
      const { data, error } = await supabase
        .from('course_weeks')
        .select('*')
        .eq('course_id', courseId)
        .order('week_number', { ascending: true });

      if (error) throw error;
      return data || [];
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('course_weeks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },

    create: async (week: {
      course_id: string;
      week_number: number;
      theme: string;
      goal: string;
      display_order?: number;
    }) => {
      const { data, error } = await supabase
        .from('course_weeks')
        .insert({
          course_id: week.course_id,
          week_number: week.week_number,
          theme: week.theme,
          goal: week.goal,
          display_order: week.display_order || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    update: async (id: string, updates: {
      week_number?: number;
      theme?: string;
      goal?: string;
      display_order?: number;
    }) => {
      const { data, error } = await supabase
        .from('course_weeks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('course_weeks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    },
  },

  // Course Lessons CRUD
  courseLessons: {
    getByWeekId: async (weekId: string) => {
      const { data, error } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('week_id', weekId)
        .order('display_order', { ascending: true })
        .order('lesson_id', { ascending: true });

      if (error) throw error;
      return data || [];
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },

    create: async (lesson: {
      week_id: string;
      lesson_id: string;
      date: string;
      topic: string;
      time: string;
      activity: string;
      deliverables: string;
      content?: string;
      key_concepts?: string[];
      videos?: Array<{ topic: string; youtubeId?: string; description?: string }>;
      notes?: string;
      display_order?: number;
    }) => {
      const { data, error } = await supabase
        .from('course_lessons')
        .insert({
          week_id: lesson.week_id,
          lesson_id: lesson.lesson_id,
          date: lesson.date,
          topic: lesson.topic,
          time: lesson.time,
          activity: lesson.activity,
          deliverables: lesson.deliverables,
          content: lesson.content || null,
          key_concepts: lesson.key_concepts || [],
          videos: lesson.videos ? JSON.stringify(lesson.videos) : null,
          notes: lesson.notes || null,
          display_order: lesson.display_order || 0,
        })
        .select()
        .single();

      if (error) throw error;
      // Parse videos JSON if it's a string
      if (data && typeof data.videos === 'string') {
        try {
          data.videos = JSON.parse(data.videos);
        } catch (e) {
          data.videos = null;
        }
      }
      return data;
    },

    update: async (id: string, updates: {
      lesson_id?: string;
      date?: string;
      topic?: string;
      time?: string;
      activity?: string;
      deliverables?: string;
      content?: string;
      key_concepts?: string[];
      videos?: Array<{ topic: string; youtubeId?: string; description?: string }>;
      notes?: string;
      display_order?: number;
    }) => {
      const updateData: any = { ...updates };
      if (updates.videos !== undefined) {
        updateData.videos = updates.videos ? JSON.stringify(updates.videos) : null;
      }

      const { data, error } = await supabase
        .from('course_lessons')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      // Parse videos JSON if it's a string
      if (data && typeof data.videos === 'string') {
        try {
          data.videos = JSON.parse(data.videos);
        } catch (e) {
          data.videos = null;
        }
      }
      return data;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('course_lessons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    },
  },

  // Course Tests CRUD
  courseTests: {
    getByCourseId: async (courseId: string) => {
      const { data, error } = await supabase
        .from('course_tests')
        .select('*')
        .eq('course_id', courseId)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(1);

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('course_tests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },

    getAll: async () => {
      const { data, error } = await supabase
        .from('course_tests')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },

    create: async (test: {
      course_id: string;
      title: string;
      description?: string;
      passing_score?: number;
      time_limit?: number;
      max_attempts?: number;
      is_active?: boolean;
      display_order?: number;
    }) => {
      const { data, error } = await supabase
        .from('course_tests')
        .insert({
          course_id: test.course_id,
          title: test.title,
          description: test.description || null,
          passing_score: test.passing_score || 75,
          time_limit: test.time_limit || null,
          max_attempts: test.max_attempts || 3,
          is_active: test.is_active !== undefined ? test.is_active : true,
          display_order: test.display_order || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    update: async (id: string, updates: {
      title?: string;
      description?: string;
      passing_score?: number;
      time_limit?: number;
      max_attempts?: number;
      is_active?: boolean;
      display_order?: number;
    }) => {
      const { data, error } = await supabase
        .from('course_tests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('course_tests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    },
  },

  // Test Questions CRUD
  testQuestions: {
    getByTestId: async (testId: string) => {
      const { data, error } = await supabase
        .from('test_questions')
        .select('*')
        .eq('test_id', testId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('test_questions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },

    create: async (question: {
      test_id: string;
      question_text: string;
      question_type?: 'multiple_choice' | 'true_false' | 'short_answer';
      options?: Array<{ text: string; is_correct: boolean }>;
      correct_answer?: string;
      points?: number;
      display_order?: number;
    }) => {
      const { data, error } = await supabase
        .from('test_questions')
        .insert({
          test_id: question.test_id,
          question_text: question.question_text,
          question_type: question.question_type || 'multiple_choice',
          options: question.options ? JSON.stringify(question.options) : null,
          correct_answer: question.correct_answer || null,
          points: question.points || 1,
          display_order: question.display_order || 0,
        })
        .select()
        .single();

      if (error) throw error;
      // Parse options JSON if it's a string
      if (data && typeof data.options === 'string') {
        try {
          data.options = JSON.parse(data.options);
        } catch (e) {
          data.options = null;
        }
      }
      return data;
    },

    update: async (id: string, updates: {
      question_text?: string;
      question_type?: 'multiple_choice' | 'true_false' | 'short_answer';
      options?: Array<{ text: string; is_correct: boolean }>;
      correct_answer?: string;
      points?: number;
      display_order?: number;
    }) => {
      const updateData: any = { ...updates };
      if (updates.options !== undefined) {
        updateData.options = updates.options ? JSON.stringify(updates.options) : null;
      }

      const { data, error } = await supabase
        .from('test_questions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      // Parse options JSON if it's a string
      if (data && typeof data.options === 'string') {
        try {
          data.options = JSON.parse(data.options);
        } catch (e) {
          data.options = null;
        }
      }
      return data;
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('test_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    },
  },

  // Test Results
  testResults: {
    getUserResults: async (testId: string, userId: string) => {
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('test_id', testId)
        .eq('user_id', userId)
        .order('attempt_number', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    getLatestResult: async (testId: string, userId: string) => {
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('test_id', testId)
        .eq('user_id', userId)
        .order('attempt_number', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data || null;
    },

    submitResult: async (result: {
      test_id: string;
      user_id: string;
      score: number;
      total_questions: number;
      correct_answers: number;
      passed: boolean;
      answers: Array<{ question_id: string; answer: string }>;
      time_taken?: number;
      attempt_number: number;
    }) => {
      const { data, error } = await supabase
        .from('test_results')
        .insert({
          test_id: result.test_id,
          user_id: result.user_id,
          score: result.score,
          total_questions: result.total_questions,
          correct_answers: result.correct_answers,
          passed: result.passed,
          answers: JSON.stringify(result.answers),
          time_taken: result.time_taken || null,
          attempt_number: result.attempt_number,
        })
        .select()
        .single();

      if (error) throw error;
      // Parse answers JSON if it's a string
      if (data && typeof data.answers === 'string') {
        try {
          data.answers = JSON.parse(data.answers);
        } catch (e) {
          data.answers = [];
        }
      }
      return data;
    },

    getAllResults: async (testId?: string) => {
      let query = supabase
        .from('test_results')
        .select('*')
        .order('completed_at', { ascending: false });

      if (testId) {
        query = query.eq('test_id', testId);
      }

      const { data, error } = await query;

      if (error) throw error;
      // Parse answers JSON for all results
      return (data || []).map(result => {
        if (typeof result.answers === 'string') {
          try {
            result.answers = JSON.parse(result.answers);
          } catch (e) {
            result.answers = [];
          }
        }
        return result;
      });
    },
  },
};

