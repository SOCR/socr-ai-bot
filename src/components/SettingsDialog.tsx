import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface Settings {
  apiKey: string;         // OpenAI
  geminiApiKey: string;   // ✅ New
  temperature: number;
  retryOnError: boolean;
}

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: Settings;
  onSave: (settings: Settings) => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onOpenChange,
  settings,
  onSave,
}) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSliderChange = (value: number[]) => {
    setLocalSettings({ ...localSettings, temperature: value[0] });
  };

  const handleSave = () => {
    onSave(localSettings);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Bot Settings</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* OpenAI Key */}
          <div className="grid gap-2">
            <Label htmlFor="api-key">OpenAI API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your OpenAI key"
              value={localSettings.apiKey}
              onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Required for text/image generation using OpenAI models.
            </p>
          </div>

          {/* Gemini Key */}
          <div className="grid gap-2">
            <Label htmlFor="gemini-api-key">Gemini API Key</Label>
            <Input
              id="gemini-api-key"
              type="password"
              placeholder="Enter your Gemini key"
              value={localSettings.geminiApiKey}
              onChange={(e) => setLocalSettings({ ...localSettings, geminiApiKey: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Required for using Google's Gemini models.
            </p>
          </div>
          
          {/* Temperature */}
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="temperature">Temperature: {localSettings.temperature.toFixed(1)}</Label>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={1}
              step={0.1}
              value={[localSettings.temperature]}
              onValueChange={handleSliderChange}
            />
            <p className="text-xs text-gray-500">
              Lower values produce more predictable responses, higher values more creative ones.
            </p>
          </div>
          
          {/* Retry */}
          <div className="flex items-center justify-between">
            <Label htmlFor="retry-on-error">Auto retry on error</Label>
            <Switch
              id="retry-on-error"
              checked={localSettings.retryOnError}
              onCheckedChange={(checked) => setLocalSettings({ ...localSettings, retryOnError: checked })}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
