import { ExternalLink, Bookmark, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { type NewsItem } from "@shared/schema";
import { useReadLater } from "@/hooks/use-news";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NewsCardProps {
  item: NewsItem;
  variant?: "ticker" | "list";
  direction?: "horizontal" | "vertical";
}

export function NewsCard({ item, variant = "ticker", direction = "horizontal" }: NewsCardProps) {
  const { isSaved, saveArticle, removeArticle } = useReadLater();
  const saved = isSaved(item.id);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      removeArticle(item.id);
    } else {
      saveArticle({
        id: item.id,
        title: item.title,
        link: item.link,
        source: item.source,
      });
    }
  };

  // Badge Color Logic
  const getSourceColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'nhk': return "bg-blue-600 text-white";
      case 'jiji': return "bg-red-600 text-white";
      case 'livedoor': return "bg-orange-500 text-white";
      case 'reuters': return "bg-orange-600 text-white";
      case 'cnn': return "bg-red-700 text-white";
      default: return "bg-gray-700 text-white";
    }
  };

  // Ticker Card (Compact)
  if (variant === "ticker") {
    return (
      <a 
        href={item.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className={cn(
          "group block relative bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden",
          direction === "horizontal" 
            ? "w-[300px] md:w-[400px] h-full flex-shrink-0 mx-3" 
            : "w-full mb-4"
        )}
      >
        <div className="p-3.5 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className={cn("text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded", getSourceColor(item.source))}>
                {item.source}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                {item.publishedAt ? formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true }) : ''}
              </span>
            </div>
            
            <h3 className="font-sans font-bold text-base leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            
            {item.description && direction === "vertical" && (
              <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/40">
            <span className="text-[10px] font-semibold text-primary flex items-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-4px] group-hover:translate-x-0">
              OPEN <ExternalLink className="w-2.5 h-2.5 ml-1" />
            </span>
            
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 rounded-lg hover:bg-primary/10 transition-colors",
                saved ? "text-primary hover:text-primary" : "text-muted-foreground hover:text-primary"
              )}
              onClick={handleToggleSave}
            >
              {saved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>
      </a>
    );
  }

  // List Card (Detailed)
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col sm:flex-row gap-5 group">
      {item.thumbnail && (
        <div className="w-full sm:w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
          <img 
            src={item.thumbnail} 
            alt={item.title} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full", getSourceColor(item.source))}>
            {item.source}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono">
              {item.publishedAt ? formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true }) : ''}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 rounded-full ml-1",
                saved ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"
              )}
              onClick={handleToggleSave}
            >
              {saved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>

        <h3 className="font-serif font-bold text-xl mb-2 text-foreground group-hover:text-primary transition-colors">
          <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-2 underline-offset-2 decoration-primary/30 hover:decoration-primary">
            {item.title}
          </a>
        </h3>
        
        {item.description && (
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-grow">
            {item.description}
          </p>
        )}
        
        <div className="mt-auto pt-2">
          <a 
            href={item.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Read full story <ExternalLink className="w-3 h-3 ml-1.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
