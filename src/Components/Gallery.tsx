import { useEffect, useMemo, useState } from "react";
import { FaSnowflake, FaSun, FaTint, FaTree, FaWalking } from "react-icons/fa";
import { useGalleryItems } from "../hooks/useApi";
import { optimizeImageUrl, preloadOptimizedImage } from "../utils/imageOptimizer";
import "./Gallery.css";

// Icon mapping for gallery items
const iconMap: { [key: string]: React.ReactNode } = {
  walking: <FaWalking />,
  snowflake: <FaSnowflake />,
  tree: <FaTree />,
  tint: <FaTint />,
  sun: <FaSun />,
};

// Fallback gallery items
const fallbackGalleryItems = [
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

const Gallery = () => {
  const { galleryItems: apiGalleryItems } = useGalleryItems();
  const [activeIndex, setActiveIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<{ [key: string]: boolean }>({});

  const galleryItems = useMemo(() => {
    const items = apiGalleryItems.length > 0 ? apiGalleryItems : fallbackGalleryItems;
    return items.map(item => ({
      ...item,
      icon: typeof item.icon === 'string' ? iconMap[item.icon] || <FaWalking /> : item.icon,
    }));
  }, [apiGalleryItems]);


  // Handle manual click
  const handleItemClick = (index: number) => {
    setActiveIndex(index);
  };

  useEffect(() => {
    // Only preload the first (active) image with high priority - automatically optimized
    // All other images will be lazy loaded when they become visible or are clicked
    if (galleryItems.length > 0) {
      const firstItem = galleryItems[0];
      // Only load if not already loaded
      if (!imagesLoaded[firstItem.id]) {
        // Use optimized image preloading with better compression
        preloadOptimizedImage(firstItem.image, {
          width: 1200,
          quality: 55, // Reduced for better compression
          priority: 'high',
        })
          .then(() => {
            setImagesLoaded((prev) => ({ ...prev, [firstItem.id]: true }));
          })
          .catch(() => {
            // Fallback to optimized version (not original) to prevent direct pixabay connection
            const optimizedFallback = optimizeImageUrl(firstItem.image, { width: 1200, quality: 55, format: 'auto' });
            const firstImg = new Image();
            firstImg.crossOrigin = 'anonymous';
            firstImg.loading = 'eager';
            firstImg.fetchPriority = 'high';
            firstImg.onload = () => {
              setImagesLoaded((prev) => ({ ...prev, [firstItem.id]: true }));
            };
            firstImg.onerror = () => {
              setImagesLoaded((prev) => ({ ...prev, [firstItem.id]: false }));
            };
            firstImg.src = optimizedFallback;
          });
      }
    }

    // Lazy load images when they become visible or when active
    let observer: IntersectionObserver | null = null;
    const timeoutId = setTimeout(() => {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const itemId = entry.target.getAttribute('data-item-id');
              if (itemId) {
                const item = galleryItems.find((g) => g.id === itemId);
                if (item && !imagesLoaded[item.id]) {
                  // Use optimized image loading with better compression
                  preloadOptimizedImage(item.image, {
                    width: 1200,
                    quality: 50, // Lower quality for lazy-loaded images
                    priority: 'low',
                  })
                    .then(() => {
                      setImagesLoaded((prev) => {
                        if (!prev[item.id]) {
                          return { ...prev, [item.id]: true };
                        }
                        return prev;
                      });
                    })
                    .catch(() => {
                      // Fallback to optimized version (not original) to prevent direct pixabay connection
                      const optimizedFallback = optimizeImageUrl(item.image, { width: 1200, quality: 55, format: 'auto' });
                      const img = new Image();
                      img.crossOrigin = 'anonymous';
                      img.loading = 'lazy';
                      img.fetchPriority = 'low';
                      img.onload = () => {
                        setImagesLoaded((prev) => {
                          if (!prev[item.id]) {
                            return { ...prev, [item.id]: true };
                          }
                          return prev;
                        });
                      };
                      img.onerror = () => {
                        setImagesLoaded((prev) => {
                          if (prev[item.id] === undefined) {
                            return { ...prev, [item.id]: false };
                          }
                          return prev;
                        });
                      };
                      img.src = optimizedFallback;
                    });
                }
              }
            }
          });
        },
        { rootMargin: '100px' } // Start loading when 100px away
      );

      const galleryElements = document.querySelectorAll('[data-gallery-item]');
      galleryElements.forEach((el) => observer?.observe(el));
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [galleryItems, imagesLoaded]);

  // Load image when item becomes active (clicked) - automatically optimized
  useEffect(() => {
    const activeItem = galleryItems[activeIndex];
    if (activeItem && !imagesLoaded[activeItem.id]) {
      preloadOptimizedImage(activeItem.image, {
        width: 1200,
        quality: 55, // Reduced for better compression
        priority: 'high',
      })
        .then(() => {
          setImagesLoaded((prev) => ({ ...prev, [activeItem.id]: true }));
        })
        .catch(() => {
          // Fallback to optimized version (not original) to prevent direct pixabay connection
          const optimizedFallback = optimizeImageUrl(activeItem.image, { width: 1200, quality: 55, format: 'auto' });
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.loading = 'eager';
          img.fetchPriority = 'high';
          img.onload = () => {
            setImagesLoaded((prev) => ({ ...prev, [activeItem.id]: true }));
          };
          img.onerror = () => {
            setImagesLoaded((prev) => ({ ...prev, [activeItem.id]: false }));
          };
          img.src = optimizedFallback;
        });
    }
  }, [activeIndex, galleryItems, imagesLoaded]);

  return (
    <section className="gallery-section py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Gallery</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our amazing moments and experiences
          </p>
        </div>
        
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="gallery-options">
            {galleryItems.map((item, index) => {
              const isLoaded = imagesLoaded[item.id] === true;
              // Use optimized image URL if loaded, otherwise use gradient
              // Lower quality for better compression
              const optimizedImageUrl = isLoaded 
                ? optimizeImageUrl(item.image, { width: 1200, quality: 55, format: 'auto' })
                : null;
              const backgroundStyle = optimizedImageUrl
                ? `url(${optimizedImageUrl})` 
                : `linear-gradient(135deg, ${item.defaultColor} 0%, ${item.defaultColor}dd 100%)`;
              
              return (
                <div
                  key={item.id}
                  className={`gallery-option ${activeIndex === index ? "active" : ""}`}
                  style={{
                    "--optionBackground": backgroundStyle,
                    "--defaultBackground": item.defaultColor,
                  } as React.CSSProperties}
                  onClick={() => handleItemClick(index)}
                  data-gallery-item
                  data-item-id={item.id}
                >
                  <div className="gallery-shadow"></div>
                  <div className="gallery-label">
                    <div className="gallery-icon">
                      {typeof item.icon === 'string' ? iconMap[item.icon] || <FaWalking /> : item.icon}
                    </div>
                    <div className="gallery-info">
                      <div className="gallery-main">{item.main}</div>
                      <div className="gallery-sub">{item.sub}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gallery;

