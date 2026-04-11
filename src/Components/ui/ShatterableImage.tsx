import { gsap } from 'gsap';
import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore
import DelaunayImport from '../../utils/delaunay';

// Use a local type for the Delaunay module
interface DelaunayType {
  triangulate: (vertices: [number, number][], key?: string) => number[];
  contains: (tri: [[number, number], [number, number], [number, number]], p: [number, number]) => [number, number] | null;
}

const Delaunay = DelaunayImport as any;

interface ShatterableImageProps {
  src: string;
  alt: string;
  className?: string;
}

const ShatterableImage: React.FC<ShatterableImageProps> = ({ src, alt, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isShattered, setIsShattered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Reset state when src changes
    setIsShattered(false);
    setImageLoaded(false);
  }, [src]);

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (isShattered || !imageLoaded || !imageRef.current || !containerRef.current) return;

    const img = imageRef.current;
    const container = containerRef.current;
    const rect = img.getBoundingClientRect();
    
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    // We use the rendered size of the image for the canvas
    const width = img.clientWidth;
    const height = img.clientHeight;

    setIsShattered(true);

    const vertices: [number, number][] = [];
    const centerX = clickX;
    const centerY = clickY;

    vertices.push([centerX, centerY]);

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
        const x = Math.cos((i / count) * TWO_PI) * radius + centerX + randomRange(-variance, variance);
        const y = Math.sin((i / count) * TWO_PI) * radius + centerY + randomRange(-variance, variance);
        vertices.push([x, y]);
      }
    });

    vertices.forEach((v) => {
      v[0] = clamp(v[0], 0, width);
      v[1] = clamp(v[1], 0, height);
    });

    const indices = Delaunay.triangulate(vertices);
    const fragments: HTMLCanvasElement[] = [];

    // Hide original image
    img.style.opacity = '0';

    for (let i = 0; i < indices.length; i += 3) {
      const p0 = vertices[indices[i + 0]];
      const p1 = vertices[indices[i + 1]];
      const p2 = vertices[indices[i + 2]];

      const xMin = Math.min(p0[0], p1[0], p2[0]);
      const xMax = Math.max(p0[0], p1[0], p2[0]);
      const yMin = Math.min(p0[1], p1[1], p2[1]);
      const yMax = Math.max(p0[1], p1[1], p2[1]);

      const box = {
        x: xMin,
        y: yMin,
        w: xMax - xMin,
        h: yMax - yMin
      };

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
        
        // Use the displayed image for drawing (it might be scaled)
        // We draw the full image onto the small canvas fragment
        ctx.drawImage(img, 0, 0, width, height);
      }

      container.appendChild(canvas);
      fragments.push(canvas);

      const centroid = [(p0[0] + p1[0] + p2[0]) / 3, (p0[1] + p1[1] + p2[1]) / 3];
      const dx = centroid[0] - centerX;
      const dy = centroid[1] - centerY;
      const d = Math.sqrt(dx * dx + dy * dy);
      const rx = 30 * (dy < 0 ? -1 : 1);
      const ry = 90 * -(dx < 0 ? -1 : 1);
      const delay = d * 0.003 * randomRange(0.9, 1.1);

      gsap.to(canvas, {
        duration: 1,
        z: -500,
        rotationX: rx,
        rotationY: ry,
        x: dx * 0.5,
        y: dy * 0.5,
        opacity: 0,
        delay: delay,
        ease: "cubic.in",
        onComplete: () => {
          canvas.remove();
        }
      });
    }

    // Reset after animation
    setTimeout(() => {
        gsap.to(img, {
            opacity: 1,
            duration: 0.5,
            onComplete: () => {
                setIsShattered(false);
            }
        });
    }, 2500);
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ perspective: '1000px' }}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isShattered ? 'pointer-events-none' : 'cursor-pointer'}`}
        onLoad={() => setImageLoaded(true)}
        onClick={handleImageClick}
      />
      {isShattered && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em]">Fragmented</span>
          </div>
      )}
    </div>
  );
};

export default ShatterableImage;
