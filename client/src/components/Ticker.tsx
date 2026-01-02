import { useEffect, useState, useRef } from "react";
import { motion, useAnimationControls, PanInfo } from "framer-motion";
import { NewsCard } from "./NewsCard";
import { type NewsItem } from "@shared/schema";
import { cn } from "@/lib/utils";

interface TickerProps {
  items: NewsItem[];
  direction: "horizontal" | "vertical";
  speed: "slow" | "medium" | "fast";
}

export function Ticker({ items, direction, speed }: TickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentSize, setContentSize] = useState(0);

  // Speed configuration (pixels per second)
  const getSpeed = () => {
    const base = direction === "horizontal" ? 50 : 30;
    switch (speed) {
      case "slow": return base * 0.5;
      case "medium": return base;
      case "fast": return base * 2;
    }
  };

  // Duplicate items to create seamless loop
  // We need enough copies to fill the screen + buffer
  const extendedItems = [...items, ...items, ...items, ...items];

  // Duration calculation
  // We assume an average width/height per card to estimate total duration
  // A more robust solution would measure the DOM, but this is a good approximation for generated code
  const cardSize = direction === "horizontal" ? 400 + 24 : 200; // width + margin or height estimate
  const totalSize = items.length * cardSize;
  const duration = totalSize / getSpeed();

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative overflow-hidden w-full h-full bg-background/50",
        direction === "horizontal" ? "flex items-center" : "flex justify-center"
      )}
    >
      {/* Gradient masks for fading edges */}
      {direction === "horizontal" ? (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
        </>
      )}

      {/* Ticker Content */}
      <div 
        className={cn(
          "flex pause-on-hover",
          direction === "horizontal" ? "flex-row animate-ticker-h" : "flex-col animate-ticker-v w-full max-w-2xl px-4"
        )}
        style={{
          // Pass CSS variables for the animation
          animationDuration: `${duration}s`,
        }}
      >
        {extendedItems.map((item, idx) => (
          <NewsCard 
            key={`${item.id}-${idx}`} 
            item={item} 
            variant="ticker" 
            direction={direction}
          />
        ))}
      </div>
    </div>
  );
}
