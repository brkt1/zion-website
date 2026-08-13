import express, { Request, Response } from 'express';

const router = express.Router();

// Events endpoint
router.get('/events', async (req: Request, res: Response) => {
  try {
    const { category, featured, limit } = req.query;
    
    // Sample events data - replace with database query
    let events = [
      {
        id: "1",
        title: "YENEGE Unity Executive Summit",
        date: "2024-02-15",
        time: "6:00 PM",
        location: "Addis Ababa",
        category: "corporate",
        image: "https://images.unsplash.com/photo-1606166188517-c613235819d4?w=800",
        description: "A curated business environment designed strictly for strategic partnerships, executive matchmaking, and brand visibility among decision makers.",
        attendees: 25,
        maxAttendees: 50,
        price: "500",
        currency: "ETB",
        featured: true,
        gallery: [
          "https://images.unsplash.com/photo-1606166188517-c613235819d4?w=400",
          "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400",
        ],
      },
      {
        id: "2",
        title: "Weekend Getaway to Debre Zeit",
        date: "2024-02-20",
        time: "8:00 AM",
        location: "Debre Zeit",
        category: "travel",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        description: "Explore the beautiful lakes and enjoy a relaxing weekend.",
        attendees: 15,
        maxAttendees: 30,
        price: "2500",
        currency: "ETB",
        featured: true,
        gallery: [
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
          "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400",
        ],
      },
      {
        id: "3",
        title: "Ethiopia’s Premier Future-Mapping Exhibition",
        date: "2024-02-25",
        time: "4:00 PM",
        location: "Addis Ababa",
        category: "community",
        image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800",
        description: "Academic & Career Path Navigator — Ethiopia’s premier future-mapping exhibition. Driven by architectural precision to seamlessly manage a 2,000-person capacity and enable confident career & academic choices.",
        attendees: 40,
        maxAttendees: 100,
        price: "Free",
        currency: "ETB",
        featured: true,
        gallery: [],
      },
    ];

    // Filter by category
    if (category && category !== 'all') {
      events = events.filter(e => e.category === category);
    }

    // Filter by featured
    if (featured === 'true') {
      events = events.filter(e => e.featured === true);
    }

    // Limit results
    if (limit) {
      const limitNum = parseInt(limit as string, 10);
      events = events.slice(0, limitNum);
    }

    res.json(events);
  } catch (error: any) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

// Single event endpoint
router.get('/events/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Sample event data - replace with database query
    const events: any = {
      "1": {
        id: "1",
        title: "YENEGE Unity Executive Summit",
        date: "2024-02-15",
        time: "6:00 PM",
        location: "Addis Ababa, Ethiopia",
        category: "corporate",
        image: "https://images.unsplash.com/photo-1606166188517-c613235819d4?w=800",
        description: `YENEGE Unity is a premier curated business environment designed strictly for strategic partnerships, executive matchmaking, and brand visibility.

What to expect:
• 1-on-1 direct executive matchmaking
• Strategic networking activations
• Curated corporate showcases
• Brand exposure to key investors and partners`,
        attendees: 25,
        maxAttendees: 50,
        price: "500",
        currency: "ETB",
        gallery: [
          "https://images.unsplash.com/photo-1606166188517-c613235819d4?w=400",
          "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400",
          "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400",
        ],
      },
    };

    const event = events[id];
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error: any) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Failed to fetch event' });
  }
});

// Categories endpoint
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = [
      { id: "game", name: "Strategic Networking Activations", description: "High-impact networking activations and curated business environments", slug: "game" },
      { id: "travel", name: "Travel", description: "Adventure and travel experiences", slug: "travel" },
      { id: "corporate", name: "Corporate", description: "Corporate events and team building", slug: "corporate" },
      { id: "community", name: "Community", description: "Curated business environments and strategic navigation systems", slug: "community" },
    ];

    res.json(categories);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// Destinations endpoint
router.get('/destinations', async (req: Request, res: Response) => {
  try {
    const destinations = [
      {
        id: "1",
        name: "Sahara",
        location: "Marrakech",
        img: "https://cdn.pixabay.com/photo/2021/11/26/17/26/dubai-desert-safari-6826298_1280.jpg",
        featured: true,
      },
      {
        id: "2",
        name: "Maldives",
        location: "Indian Ocean",
        img: "https://cdn.pixabay.com/photo/2017/01/20/00/30/maldives-1993704_1280.jpg",
        featured: true,
      },
      {
        id: "3",
        name: "Dolomites",
        location: "Italy",
        img: "https://cdn.pixabay.com/photo/2020/03/29/09/24/pale-di-san-martino-4979964_1280.jpg",
        featured: true,
      },
      {
        id: "4",
        name: "Highland",
        location: "Scotland",
        img: "https://cdn.pixabay.com/photo/2014/11/21/03/26/neist-point-540119_1280.jpg",
      },
      {
        id: "5",
        name: "Kleifarvatn",
        location: "Iceland",
        img: "https://cdn.pixabay.com/photo/2017/03/02/16/54/iceland-2111811_1280.jpg",
      },
      {
        id: "6",
        name: "Taj Mahal",
        location: "India",
        img: "https://cdn.pixabay.com/photo/2023/08/19/13/26/ai-generated-8200484_1280.jpg",
      },
      {
        id: "7",
        name: "Colorado",
        location: "Arizona",
        img: "https://cdn.pixabay.com/photo/2016/11/29/03/13/desert-1867005_1280.jpg",
      },
      {
        id: "8",
        name: "Santorin",
        location: "Greece",
        img: "https://cdn.pixabay.com/photo/2017/01/30/07/54/church-2020258_1280.jpg",
      },
      {
        id: "9",
        name: "Petra",
        location: "Jordan",
        img: "https://cdn.pixabay.com/photo/2019/07/20/19/12/petra-4351361_1280.jpg",
      },
      {
        id: "10",
        name: "Fundy",
        location: "Canada",
        img: "https://cdn.pixabay.com/photo/2020/11/22/07/11/river-5765785_1280.jpg",
      },
      {
        id: "11",
        name: "Fuji",
        location: "Japan",
        img: "https://cdn.pixabay.com/photo/2016/12/12/22/31/japan-1902834_1280.jpg",
      },
      {
        id: "12",
        name: "Ha Long Bay",
        location: "Vietnam",
        img: "https://cdn.pixabay.com/photo/2022/10/21/10/00/marvel-7536676_1280.jpg",
      },
    ];

    res.json(destinations);
  } catch (error: any) {
    console.error('Error fetching destinations:', error);
    res.status(500).json({ message: 'Failed to fetch destinations' });
  }
});

// Gallery endpoint
router.get('/gallery', async (req: Request, res: Response) => {
  try {
    const galleryItems = [
      {
        id: "1",
        image: "https://cdn.pixabay.com/photo/2016/11/29/03/13/desert-1867005_1280.jpg",
        icon: "walking",
        main: "Adventures",
        sub: "Explore amazing destinations",
        defaultColor: "#ED5565",
      },
      {
        id: "2",
        image: "https://cdn.pixabay.com/photo/2017/03/02/16/54/iceland-2111811_1280.jpg",
        icon: "snowflake",
        main: "Winter Escapes",
        sub: "Snowy mountain adventures",
        defaultColor: "#FC6E51",
      },
      {
        id: "3",
        image: "https://cdn.pixabay.com/photo/2014/11/21/03/26/neist-point-540119_1280.jpg",
        icon: "tree",
        main: "Nature Trails",
        sub: "Discover natural beauty",
        defaultColor: "#FFCE54",
      },
      {
        id: "4",
        image: "https://cdn.pixabay.com/photo/2020/11/22/07/11/river-5765785_1280.jpg",
        icon: "tint",
        main: "Waterfalls",
        sub: "Majestic water wonders",
        defaultColor: "#2ECC71",
      },
      {
        id: "5",
        image: "https://cdn.pixabay.com/photo/2017/01/20/00/30/maldives-1993704_1280.jpg",
        icon: "sun",
        main: "Sunset Views",
        sub: "Beautiful golden hours",
        defaultColor: "#5D9CEC",
      },
    ];

    res.json(galleryItems);
  } catch (error: any) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({ message: 'Failed to fetch gallery items' });
  }
});

// About content endpoint
router.get('/content/about', async (req: Request, res: Response) => {
  try {
    const aboutContent = {
      story: {
        title: "The Yenege Dream",
        content: `Yenege was born from a simple yet powerful vision: to design impactful experience systems through strategic management and architectural precision.

We believe that life's greatest moments happen when organizations build systems that are professional, seamless, and designed with intention.

What started as a dream to introduce world-class event architectures to Addis Ababa has grown into a premier education and logistics platform for experience architecture.

Every event we organize, every trip we plan, and every system we host is designed with one goal in mind: to bring professional precision to the experience industry.`,
      },
      values: [
        {
          number: "01",
          title: "Precision First",
          description: "Everything we do is centered around technical mastery, strategic management, and architectural precision.",
        },
        {
          number: "02",
          title: "Community",
          description: "We believe in the power of connection and building lasting friendships.",
        },
        {
          number: "03",
          title: "Adventure",
          description: "Life is meant to be explored. We encourage stepping out of comfort zones.",
        },
        {
          number: "04",
          title: "Inclusivity",
          description: "Everyone is welcome. We celebrate diversity and create safe spaces for all.",
        },
      ],
      mission: {
        title: "Our Mission",
        content: "To empower tomorrow through strategic management and architectural precision, building a world-class network of event professionals, custom travel systems, and curated business environments.",
      },
      vision: {
        title: "Our Vision",
        content: "To become the leading architect of culture and events in the region, setting global standards for execution, and building a community where members master strategic experience systems.",
      },
      milestones: [
        { year: "2024", title: "Launch", description: "Yenege officially launched with our first community events" },
        { year: "2024", title: "Growth", description: "Expanded to include travel adventures and corporate events" },
        { year: "Future", title: "Expansion", description: "Building towards becoming Ethiopia's premier lifestyle platform" },
      ],
      ceo: {
        name: "Bereket Yosef",
        title: "Founder & CEO",
        bio: "Bereket Yosef is a visionary entrepreneur dedicated to redefining the experience economy in Ethiopia. With a background in strategic event management and community development, he founded Yenege to create a platform that balances professional execution with transformative education. His mission is to empower a new generation of creatives while delivering world-class lifestyle experiences.",
        quote: "We don't just organize events; we architect the moments that define a lifetime.",
        image: "",
        socialLinks: [
          { platform: "LinkedIn", url: "https://www.linkedin.com/in/bereket-yosef-b99a0622a/" }
        ]
      }
    };

    res.json(aboutContent);
  } catch (error: any) {
    console.error('Error fetching about content:', error);
    res.status(500).json({ message: 'Failed to fetch about content' });
  }
});

// Contact info endpoint
router.get('/content/contact', async (req: Request, res: Response) => {
  try {
    const contactInfo = {
      email: "yenegeevents@gmail.com",
      phone: "+251978639887",
      phoneFormatted: "+251 978 639 887",
      location: "Addis Ababa, Ethiopia",
      socialLinks: [
        { platform: "Instagram", url: "https://instagram.com/yenege" },
        { platform: "Telegram", url: "https://t.me/yenege" },
        { platform: "TikTok", url: "https://tiktok.com/@yenege" },
        { platform: "YouTube", url: "https://youtube.com/@yenege" },
      ],
    };

    res.json(contactInfo);
  } catch (error: any) {
    console.error('Error fetching contact info:', error);
    res.status(500).json({ message: 'Failed to fetch contact info' });
  }
});

// Site config endpoint
router.get('/config', async (req: Request, res: Response) => {
  try {
    const config = {
      siteName: "YENEGE",
      logo: "/logo.png",
      navigation: [
        { path: "/", label: "Home" },
        { path: "/events", label: "Events" },
        { path: "/travel", label: "Travel & Adventures" },
        { path: "/community", label: "Community" },
        { path: "/about", label: "About" },
        { path: "/contact", label: "Contact" },
      ],
      footer: {
        description: "Designing impactful experience systems through events, travel adventures, and community connections.",
        quickLinks: [
          { path: "/", label: "Home" },
          { path: "/events", label: "Events" },
          { path: "/travel", label: "Travel & Adventures" },
          { path: "/community", label: "Community" },
          { path: "/about", label: "About" },
          { path: "/contact", label: "Contact" },
        ],
      },
    };

    res.json(config);
  } catch (error: any) {
    console.error('Error fetching site config:', error);
    res.status(500).json({ message: 'Failed to fetch site config' });
  }
});

// Home content endpoint
router.get('/content/home', async (req: Request, res: Response) => {
  try {
    const homeContent = {
      hero: {
        slogan: "Precision in Experience Architecture",
        intro: "Yenege is a premier experience platform operating at the intersection of professional execution, education, and community. We build certified event architects, curated business environments, and strategic experience systems.",
        categories: [
          { label: "Game Nights", path: "/events?category=game" },
          { label: "Travel", path: "/travel" },
          { label: "Community", path: "/community" },
        ],
      },
      categories: [
        {
          id: "1",
          title: "Events",
          description: "Fun-filled evenings with board games, trivia, and interactive challenges. Perfect for making new friends!",
          link: "/events?category=game",
          number: "01",
        },
        {
          id: "2",
          title: "Travel & Adventures",
          description: "Weekend getaways, day trips, and exciting adventures. Explore new places with amazing people.",
          link: "/travel",
          number: "02",
        },
        {
          id: "3",
          title: "Community",
          description: "Join a vibrant community of happy people. Share stories, connect, and build lasting friendships.",
          link: "/community",
          number: "03",
        },
      ],
      cta: {
        title: "Ready to Join the Elite Circle?",
        description: "Be part of an elite circle that masters strategic execution, coordinates complex systems, and designs impactful experience environments.",
        buttons: [
          { text: "Explore Events", link: "/events", type: "primary" },
          { text: "Contact via WhatsApp", link: "https://wa.me/251978639887", type: "secondary" },
        ],
      },
    };

    res.json(homeContent);
  } catch (error: any) {
    console.error('Error fetching home content:', error);
    res.status(500).json({ message: 'Failed to fetch home content' });
  }
});

export default router;

