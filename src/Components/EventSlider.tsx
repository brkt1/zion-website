import React, { useState, useEffect } from 'react';
import { IoArrowBackOutline, IoArrowForwardOutline } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import { Event } from '../services/api';
import './EventSlider.css';

interface EventSliderProps {
  events?: Event[];
}

const placeholderImages = [
  'https://i.redd.it/tc0aqpv92pn21.jpg',
  'https://wharferj.files.wordpress.com/2015/11/bio_north.jpg',
  'https://images7.alphacoders.com/878/878663.jpg',
  'https://theawesomer.com/photos/2017/07/simon_stalenhag_the_electric_state_6.jpg',
  'https://da.se/app/uploads/2015/09/simon-december1994.jpg',
];

const EventSlider: React.FC<EventSliderProps> = ({ events = [] }) => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (events.length === 0) return;

    const mappedEvents = events.map((ev, i) => {
      const dateObj = new Date(ev.date);
      const dateStr = isNaN(dateObj.getTime()) ? ev.date : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      return {
        id: ev.id,
        img: ev.image || placeholderImages[i % placeholderImages.length],
        title: ev.title,
        desc: ev.description,
        date: dateStr,
        category: ev.category,
        locationLink: ev.location.startsWith('http') ? ev.location : `https://maps.google.com/?q=${encodeURIComponent(ev.location)}`,
        priceStr: `${ev.price || 'Free'} ${ev.currency || ''}`.trim(),
        link: `/events/${ev.id}`
      };
    });

    const finalItems = [...mappedEvents];

    // Pad with cloned events if less than 6 items to keep the slider looking full
    let i = 0;
    while (finalItems.length < 6) {
      const baseItem = mappedEvents[i % mappedEvents.length];
      finalItems.push({
        ...baseItem,
        id: `${baseItem.id}-clone-${i}`,
      });
      i++;
    }

    setItems(finalItems);
  }, [events]);

  // Auto-navigate every 5 seconds
  useEffect(() => {
    if (items.length === 0) return;
    const interval = setInterval(() => {
      setItems((prev) => [...prev.slice(1), prev[0]]);
    }, 7000);
    return () => clearInterval(interval);
  }, [items]);

  const nextSlide = () => {
    if (items.length === 0) return;
    setItems((prev) => [...prev.slice(1), prev[0]]);
  };

  const prevSlide = () => {
    if (items.length === 0) return;
    setItems((prev) => [prev[prev.length - 1], ...prev.slice(0, prev.length - 1)]);
  };

  if (items.length === 0) return null;

  return (
    <div className="event-slider-main">
      <ul className="slider">
        {items.map((item) => (
          <li
            key={item.id}
            className="item"
            style={{ backgroundImage: `url('${item.img}')` }}
          >
            <div className="content">
              <h2 className="title">{item.title}</h2>
              <div className="event-meta" style={{ display: 'flex', gap: '15px', marginBottom: '10px', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#FFD447', flexWrap: 'wrap' }}>
                <span>{item.date}</span>
                <span>•</span>
                <span>{item.category}</span>
                <span>•</span>
                <span>{item.priceStr}</span>
              </div>
              <p className="description" style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>{item.desc}</p>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to={item.link}>
                  <button>Read More</button>
                </Link>
                {item.locationLink !== '#' && (
                  <a href={item.locationLink} target="_blank" rel="noopener noreferrer">
                    <button style={{ backgroundColor: 'transparent', borderColor: '#FFD447', color: '#FFD447' }}>Map</button>
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <nav className="nav">
        <button className="btn prev" onClick={prevSlide} aria-label="Previous">
          <IoArrowBackOutline size={24} />
        </button>
        <button className="btn next" onClick={nextSlide} aria-label="Next">
          <IoArrowForwardOutline size={24} />
        </button>
      </nav>
    </div>
  );
};

export default EventSlider;
