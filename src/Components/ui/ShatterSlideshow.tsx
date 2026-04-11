import { gsap } from 'gsap';
import React, { useCallback, useEffect, useRef, useState } from 'react';
// @ts-ignore
import DelaunayImport from '../../utils/delaunay';

const Delaunay = DelaunayImport as any;

interface ShatterSlideshowProps {
  images: string[];
  interval?: number;
}

const ShatterSlideshow: React.FC<ShatterSlideshowProps> = ({ images, interval = 4000 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShattering, setIsShattering] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const triggerShatter = useCallback(() => {
    if (isShattering || !loaded || !imageRef.current || !containerRef.current) return;

    const img = imageRef.current;
    const container = containerRef.current;
    
    // We use the rendered size
    const width = img.clientWidth;
    const height = img.clientHeight;

    // Pick a random trigger point inside the image for variety
    const clickX = width * (0.2 + Math.random() * 0.6);
    const clickY = height * (0.2 + Math.random() * 0.6);

    setIsShattering(true);

    const vertices: [number, number][] = [];
    vertices.push([clickX, clickY]);

    const rings = [
      { r: 50, c: 12 },
      { r: 150, c: 12 },
      { r: 300, c: 12 },
      { r: 1200, c: 12 }
    ];

    const TWO_PI = Math.PI * 2;
    const randomRange = (min: number, max: number) => min + (max - min) * Math.random();
    const clamp = (x: number, min: number, max: number) => x < min ? min : (x > max ? max : x);

    rings.forEach((ring) => {
      const radius = ring.r;
      const count = ring.c;
      const variance = radius * 0.25;
      for (let i = 0; i < count; i++) {
        const x = Math.cos((i / count) * TWO_PI) * radius + clickX + randomRange(-variance, variance);
        const y = Math.sin((i / count) * TWO_PI) * radius + clickY + randomRange(-variance, variance);
        vertices.push([x, y]);
      }
    });

    vertices.forEach((v) => {
      v[0] = clamp(v[0], 0, width);
      v[1] = clamp(v[1], 0, height);
    });

    const indices = Delaunay.triangulate(vertices);
    img.style.opacity = '0';

    const timeline = gsap.timeline({
      onComplete: () => {
        setIsShattering(false);
        setLoaded(false);
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }
    });

    for (let i = 0; i < indices.length; i += 3) {
      const p0 = vertices[indices[i + 0]];
      const p1 = vertices[indices[i + 1]];
      const p2 = vertices[indices[i + 2]];

      const xMin = Math.min(p0[0], p1[0], p2[0]);
      const xMax = Math.max(p0[0], p1[0], p2[0]);
      const yMin = Math.min(p0[1], p1[1], p2[1]);
      const yMax = Math.max(p0[1], p1[1], p2[1]);

      const box = { x: xMin, y: yMin, w: xMax - xMin, h: yMax - yMin };
      const canvas = document.createElement('canvas');
      canvas.width = box.w;
      canvas.height = box.h;
      canvas.style.position = 'absolute';
      canvas.style.left = `${box.x}px`;
      canvas.style.top = `${box.y}px`;
      canvas.style.width = `${box.w}px`;
      canvas.style.height = `${box.h}px`;
      canvas.style.pointerEvents = 'none';
      canvas.style.backfaceVisibility = 'hidden';
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(-box.x, -box.y);
        ctx.beginPath();
        ctx.moveTo(p0[0], p0[1]);
        ctx.lineTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 0, 0, width, height);
      }

      container.appendChild(canvas);

      const centroid = [(p0[0] + p1[0] + p2[0]) / 3, (p0[1] + p1[1] + p2[1]) / 3];
      const dx = centroid[0] - clickX;
      const dy = centroid[1] - clickY;
      const d = Math.sqrt(dx * dx + dy * dy);
      const delay = d * 0.003 * randomRange(0.9, 1.1);

      timeline.to(canvas, {
        duration: 1.2,
        z: -800,
        rotationX: 45 * (dy < 0 ? -1 : 1),
        rotationY: 90 * -(dx < 0 ? -1 : 1),
        x: dx * 0.8,
        y: dy * 0.8,
        opacity: 0,
        ease: "power2.in",
        onComplete: () => canvas.remove()
      }, delay);
    }
  }, [isShattering, loaded, images.length]);

  useEffect(() => {
    if (loaded && !isShattering) {
      const timer = setTimeout(triggerShatter, interval);
      return () => clearTimeout(timer);
    }
  }, [loaded, isShattering, interval, triggerShatter]);

  useEffect(() => {
    // Smooth fade in for the new image when index changes
    if (imageRef.current) {
        gsap.fromTo(imageRef.current, 
            { opacity: 0, scale: 1.1 }, 
            { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" }
        );
    }
  }, [currentIndex]);

  if (!images || images.length === 0) return null;

  return (
    <div 
      ref={containerRef} 
      className="relative w-full aspect-square md:aspect-[4/5] rounded-[32px] overflow-hidden bg-black shadow-xl"
      style={{ perspective: '1200px' }}
    >
      <img
        ref={imageRef}
        src={images[currentIndex]}
        alt={`Gallery Item ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-opacity duration-500"
        onLoad={() => setLoaded(true)}
      />
      
      <div className="absolute bottom-6 left-6 z-10">
        <div className="flex items-center gap-3">
            <span className="ed-font-serif text-white/60 text-3xl font-black italic select-none">
                {(currentIndex + 1).toString().padStart(2, '0')}
            </span>
            <div className="h-px w-8 bg-white/20" />
            <span className="ed-font-sans text-white/40 text-[8px] font-black uppercase tracking-[0.3em]">
                Curation Series
            </span>
        </div>
      </div>

      {/* Progress Line */}
      <div className="absolute bottom-0 left-0 h-1 bg-[#FFD447] transition-all duration-300 z-20" 
           style={{ width: `${((currentIndex + 1) / images.length) * 100}%` }} />
    </div>
  );
};

export default ShatterSlideshow;
