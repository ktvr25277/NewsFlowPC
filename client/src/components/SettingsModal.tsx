import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { useNewsSettings } from "@/hooks/use-news";
import { RotateCcw, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { type NewsSettings } from "@shared/schema";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AVAILABLE_SOURCES = [
  { id: "nhk", label: "NHK News" },
  { id: "jiji", label: "Google News" },
  { id: "livedoor", label: "Livedoor News" },
];

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { settings, updateSettings } = useNewsSettings();
  const [localSettings, setLocalSettings] = useState<NewsSettings>(settings);

  // Sync local state when settings load or modal opens
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, open]);

  const handleSave = () => {
    console.log("Saving settings:", localSettings);
    updateSettings(localSettings);
    onOpenChange(false);
  };

  const handleSourceToggle = (sourceId: string) => {
    setLocalSettings(prev => {
      const sources = prev.sources.includes(sourceId)
        ? prev.sources.filter(s => s !== sourceId)
        : [...prev.sources, sourceId];
      return { ...prev, sources };
    });
  };

  const speedValueToLabel = (speed: string) => {
    switch (speed) {
      case 'slow': return 'Slow (Relaxed)';
      case 'medium': return 'Medium (Default)';
      case 'fast': return 'Fast (Overview)';
      default: return speed;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-background/95 backdrop-blur-md border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Preferences</DialogTitle>
          <DialogDescription>
            Customize your news feed experience.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Scroll Direction */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Scroll Direction</Label>
            <RadioGroup 
              value={localSettings.scrollDirection} 
              onValueChange={(val: any) => setLocalSettings(prev => ({ ...prev, scrollDirection: val }))}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="horizontal" id="horizontal" className="peer sr-only" />
                <Label
                  htmlFor="horizontal"
                  className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all"
                >
                  <span className="text-xl mb-2">↔️</span>
                  Horizontal
                </Label>
              </div>
              <div>
                <RadioGroupItem value="vertical" id="vertical" className="peer sr-only" />
                <Label
                  htmlFor="vertical"
                  className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all"
                >
                  <span className="text-xl mb-2">↕️</span>
                  Vertical
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Scroll Speed */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-base font-semibold">Scroll Speed</Label>
              <span className="text-sm text-muted-foreground">{speedValueToLabel(localSettings.scrollSpeed)}</span>
            </div>
            <div className="flex gap-2">
              {['slow', 'medium', 'fast'].map((speed) => (
                <Button
                  key={speed}
                  type="button"
                  variant={localSettings.scrollSpeed === speed ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setLocalSettings(prev => ({ ...prev, scrollSpeed: speed as any }))}
                >
                  {speed.charAt(0).toUpperCase() + speed.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Sources */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Sources</Label>
            <div className="grid grid-cols-2 gap-3">
              {AVAILABLE_SOURCES.map((source) => (
                <div key={source.id} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    id={`source-${source.id}`} 
                    checked={localSettings.sources.includes(source.id)}
                    onCheckedChange={() => handleSourceToggle(source.id)}
                  />
                  <Label htmlFor={`source-${source.id}`} className="cursor-pointer flex-1">
                    {source.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Refresh Rate */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label className="text-base font-semibold">Auto-Refresh</Label>
              <span className="text-sm text-muted-foreground">{Math.floor(localSettings.refreshInterval / 60)} minutes</span>
            </div>
            <Slider
              value={[localSettings.refreshInterval]}
              min={60}
              max={3600}
              step={60}
              onValueChange={([val]) => setLocalSettings(prev => ({ ...prev, refreshInterval: val }))}
              className="py-4"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
