import { Link } from "wouter";
import { ArrowLeft, Trash2, Bookmark, ExternalLink } from "lucide-react";
import { useReadLater } from "@/hooks/use-news";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function ReadLater() {
  const { savedArticles, removeArticle } = useReadLater();

  const sortedArticles = [...savedArticles].sort((a, b) => 
    new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-serif font-bold flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-primary" fill="currentColor" />
              Read Later
              <span className="text-sm font-sans font-normal text-muted-foreground ml-2 bg-muted px-2 py-0.5 rounded-full">
                {savedArticles.length}
              </span>
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {savedArticles.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bookmark className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Your reading list is empty</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Articles you bookmark from the news feed will appear here so you can read them when you have time.
            </p>
            <Link href="/">
              <Button size="lg">Go to Feed</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedArticles.map((article) => (
              <div 
                key={article.id}
                className="group bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {article.source}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Saved {formatDistanceToNow(new Date(article.savedAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <h3 className="font-serif font-bold text-lg sm:text-xl leading-snug hover:text-primary transition-colors">
                      <a href={article.link} target="_blank" rel="noopener noreferrer">
                        {article.title}
                      </a>
                    </h3>
                    
                    <div className="pt-2 flex items-center gap-4">
                      <a 
                        href={article.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                      >
                        Read Article <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                    onClick={() => removeArticle(article.id)}
                    title="Remove from list"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
