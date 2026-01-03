import { useEffect, useState, useRef } from "react";
import { motion, useAnimationControls, PanInfo } from "framer-motion";
import { NewsCard } from "./NewsCard";
import { type NewsItem } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useNewsSettings } from "@/hooks/use-news";

interface TickerProps {
  items: NewsItem[];
  direction: "horizontal" | "vertical";
  speed: "slow" | "medium" | "fast";
}

export function Ticker({ items, direction, speed }: TickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [contentSize, setContentSize] = useState(0);

  // Speed configuration (pixels per second)
  const { settings } = useNewsSettings();
  const getSpeed = () => {
    const base = direction === "horizontal" ? 40 : 30;
    switch (speed) {
      case "slow": return base * 0.4;
      case "medium": return base;
      case "fast": return base * 1.8;
    }
  };

  // Duplicate items to create seamless loop
  const extendedItems = [...items, ...items, ...items, ...items];

  // Duration calculation
  const cardSize = direction === "horizontal" ? (window.innerWidth < 640 ? 300 : 400) : 160; 
  const totalSize = items.length * cardSize;
  const duration = totalSize / getSpeed();

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative overflow-hidden w-full h-full bg-background/30",
        direction === "horizontal" ? "flex items-stretch p-0" : "flex flex-col items-center pt-4 sm:pt-8"
      )}
    >
      {/* Ticker Content */}
      <div 
        key={`${direction}-${speed}-${items.length}-${settings.sources.join(",")}`}
        className={cn(
          "flex",
          direction === "horizontal" ? "flex-row animate-ticker-h" : "flex-col animate-ticker-v w-full max-w-3xl px-2"
        )}
        style={{
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
