
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: {
    apiKey: string;
    temperature: number;
    retryOnError: boolean;
  };
  onSave: (settings: { apiKey: string; temperature: number; retryOnError: boolean }) => void;
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
          <div className="grid gap-2">
            <Label htmlFor="api-key">OpenAI API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your API key"
              value={localSettings.apiKey}
              onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Required for synthetic text and image generation.
            </p>
          </div>
          
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
