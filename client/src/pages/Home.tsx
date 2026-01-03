import { useState } from "react";
import { Link } from "wouter";
import { Settings, Bookmark, RefreshCw, Newspaper, WifiOff } from "lucide-react";
import { useNews, useNewsSettings, useSyncNews } from "@/hooks/use-news";
import { Ticker } from "@/components/Ticker";
import { SettingsModal } from "@/components/SettingsModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { settings, isLoaded } = useNewsSettings();
  const { data: newsItems, isLoading, error, refetch } = useNews(settings.sources);
  const { mutate: syncNews, isPending: isSyncing } = useSyncNews();

  const handleSync = () => {
    syncNews(undefined, {
      onSuccess: () => refetch()
    });
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background space-y-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground animate-pulse font-mono text-sm">Loading your feed...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-6 text-center">
        <WifiOff className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Unable to fetch the latest news. Please check your internet connection and try again.
        </p>
        <Button onClick={() => refetch()} size="lg">
          Try Again
        </Button>
      </div>
    );
  }

  const hasNews = newsItems && newsItems.length > 0;

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background text-foreground">
      {/* Header */}
      <header className="flex-none h-14 border-b border-border bg-card/80 backdrop-blur-md z-50 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <div className="bg-primary/10 p-1.5 rounded-lg">
            <Newspaper className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-lg font-bold tracking-tight hidden sm:block">
            News<span className="text-primary">Flow</span>
          </h1>
        </div>

        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSync}
            disabled={isSyncing}
            className={cn("text-muted-foreground hover:text-foreground h-9 w-9", isSyncing && "animate-spin")}
            title="Force Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          <div className="h-4 w-px bg-border mx-1" />

          <Link href="/read-later">
            <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-muted-foreground hover:text-foreground">
              <Bookmark className="w-4 h-4" />
              <span className="hidden sm:inline">Saved</span>
            </Button>
          </Link>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSettingsOpen(true)}
            className="h-9 gap-1.5 shadow-sm"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden bg-muted/5">
        {hasNews ? (
          <Ticker 
            key={`${settings.scrollDirection}-${settings.scrollSpeed}-${Date.now()}`}
            items={newsItems} 
            direction={settings.scrollDirection} 
            speed={settings.scrollSpeed} 
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="bg-muted p-6 rounded-full mb-6">
              <Newspaper className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No News Available</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              We couldn't find any news from your selected sources. Try adding more sources in settings or refreshing.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => setSettingsOpen(true)} variant="outline">
                Check Settings
              </Button>
              <Button onClick={handleSync}>
                Fetch Now
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="flex-none bg-card/80 backdrop-blur-sm border-t border-border py-2 px-6 flex justify-between items-center text-xs text-muted-foreground">
        <div>
          {hasNews ? (
            <span>Showing {newsItems.length} stories from {settings.sources.length} sources</span>
          ) : (
            <span>No stories loaded</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span>Auto-refresh: {Math.floor(settings.refreshInterval / 60)}m</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </footer>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
