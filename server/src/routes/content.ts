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
        title: "Friday Game Night",
        date: "2024-02-15",
        time: "6:00 PM",
        location: "Addis Ababa",
        category: "game",
        image: "https://images.unsplash.com/photo-1606166188517-c613235819d4?w=800",
        description: "Join us for an evening of board games, trivia, and fun!",
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
        title: "Community Meetup",
        date: "2024-02-25",
        time: "4:00 PM",
        location: "Addis Ababa",
        category: "community",
        image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800",
        description: "Connect with fellow community members and share stories.",
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
        title: "Friday Game Night",
        date: "2024-02-15",
        time: "6:00 PM",
        location: "Addis Ababa, Ethiopia",
        category: "game",
        image: "https://images.unsplash.com/photo-1606166188517-c613235819d4?w=800",
        description: `Join us for an unforgettable evening of fun, games, and laughter! Our Friday Game Night is the perfect way to unwind after a long week and meet amazing people in the community.

What to expect:
• Board games for all skill levels
• Trivia challenges with prizes
• Interactive group activities
• Delicious snacks and refreshments
• Great music and atmosphere

Whether you're a game enthusiast or just looking to have a good time, everyone is welcome!`,
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
      { id: "game", name: "Game Nights", description: "Fun-filled game events", slug: "game" },
      { id: "travel", name: "Travel", description: "Adventure and travel experiences", slug: "travel" },
      { id: "corporate", name: "Corporate", description: "Corporate events and team building", slug: "corporate" },
      { id: "community", name: "Community", description: "Community meetups and gatherings", slug: "community" },
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
        content: `Yenege was born from a simple yet powerful vision: to bring happiness to life through meaningful connections and unforgettable experiences.

We believe that life's greatest moments happen when people come together—whether it's over a board game, on a weekend adventure, or simply sharing stories in a welcoming community space.

What started as a dream to create a space where people could escape the daily grind and truly connect has grown into a vibrant community of individuals who value joy, friendship, and living life to the fullest.

Every event we organize, every trip we plan, and every gathering we host is designed with one goal in mind: to bring a little more happiness into your life.`,
      },
      values: [
        {
          number: "01",
          title: "Happiness First",
          description: "Everything we do is centered around bringing joy and positivity into people's lives.",
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
        content: "To create a vibrant community platform that brings people together through engaging events, exciting adventures, and meaningful connections, making happiness accessible to everyone.",
      },
      vision: {
        title: "Our Vision",
        content: "To become the leading lifestyle and events platform in Ethiopia, known for creating unforgettable experiences and building a community where every member feels valued and happy.",
      },
      milestones: [
        { year: "2024", title: "Launch", description: "Yenege officially launched with our first community events" },
        { year: "2024", title: "Growth", description: "Expanded to include travel adventures and corporate events" },
        { year: "Future", title: "Expansion", description: "Building towards becoming Ethiopia's premier lifestyle platform" },
      ],
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
      email: "bereketyosef49@gmail.com",
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
        description: "Bringing happiness to life through events, adventures, and community connections.",
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
        slogan: "Bringing Happiness to Life",
        intro: "Yenege is a vibrant community dedicated to creating unforgettable experiences. We bring people together through exciting game nights, amazing travel adventures, and meaningful connections that celebrate life's beautiful moments.",
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
        title: "Ready to Join the Fun?",
        description: "Be part of a community that celebrates life, creates memories, and brings happiness to every moment.",
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

