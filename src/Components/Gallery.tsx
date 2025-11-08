import { useEffect, useMemo, useState } from "react";
import { FaSnowflake, FaSun, FaTint, FaTree, FaWalking } from "react-icons/fa";
import { useGalleryItems } from "../hooks/useApi";
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

  useEffect(() => {
    // Preload images
    const imagePromises = galleryItems.map((item) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          setImagesLoaded((prev) => ({ ...prev, [item.id]: true }));
          resolve();
        };
        img.onerror = () => {
          setImagesLoaded((prev) => ({ ...prev, [item.id]: false }));
          resolve();
        };
        img.src = item.image;
      });
    });

    Promise.all(imagePromises);
  }, [galleryItems]);

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
              const isLoaded = imagesLoaded[item.id] !== false;
              const backgroundStyle = isLoaded 
                ? `url(${item.image})` 
                : `linear-gradient(135deg, ${item.defaultColor} 0%, ${item.defaultColor}dd 100%)`;
              
              return (
                <div
                  key={item.id}
                  className={`gallery-option ${activeIndex === index ? "active" : ""}`}
                  style={{
                    "--optionBackground": backgroundStyle,
                    "--defaultBackground": item.defaultColor,
                  } as React.CSSProperties}
                  onClick={() => setActiveIndex(index)}
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

