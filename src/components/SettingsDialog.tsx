import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { apiKeyStorage } from '@/lib/utils';
import apiService from '@/lib/apiService';
import { KeyValidationResult, validateGeminiKey, validateOpenAIKey } from '@/lib/keyValidation';

interface Settings {
  apiKey: string;         // OpenAI
  geminiApiKey: string;   // Gemini
  temperature: number;
  retryOnError: boolean;
}

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (settings: Settings) => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onOpenChange,
  onSave,
}) => {
  // Load initial settings from storage
  const [localSettings, setLocalSettings] = useState<Settings>({
    apiKey: apiKeyStorage.getOpenAIApiKey() || '',
    geminiApiKey: apiKeyStorage.getGeminiApiKey() || '',
    temperature: apiKeyStorage.getTemperature(),
    retryOnError: apiKeyStorage.getRetryOnError(),
  });

  const [openaiStatus, setOpenaiStatus] = useState<KeyValidationResult>({ status: 'idle', message: '' });
  const [geminiStatus, setGeminiStatus] = useState<KeyValidationResult>({ status: 'idle', message: '' });
  const [saving, setSaving] = useState(false);
  const openaiDebounce = useRef<ReturnType<typeof setTimeout>>();
  const geminiDebounce = useRef<ReturnType<typeof setTimeout>>();

  // Update local settings when dialog opens
  useEffect(() => {
    if (open) {
      setLocalSettings({
        apiKey: apiKeyStorage.getOpenAIApiKey() || '',
        geminiApiKey: apiKeyStorage.getGeminiApiKey() || '',
        temperature: apiKeyStorage.getTemperature(),
        retryOnError: apiKeyStorage.getRetryOnError(),
      });
      setOpenaiStatus({ status: 'idle', message: '' });
      setGeminiStatus({ status: 'idle', message: '' });
    }
  }, [open]);

  // Validate keys as the user types (debounced) so problems surface before Save
  useEffect(() => {
    clearTimeout(openaiDebounce.current);
    if (!localSettings.apiKey.trim()) {
      setOpenaiStatus({ status: 'idle', message: '' });
      return;
    }
    setOpenaiStatus({ status: 'checking', message: '' });
    openaiDebounce.current = setTimeout(async () => {
      setOpenaiStatus(await validateOpenAIKey(localSettings.apiKey));
    }, 600);
    return () => clearTimeout(openaiDebounce.current);
  }, [localSettings.apiKey]);

  useEffect(() => {
    clearTimeout(geminiDebounce.current);
    if (!localSettings.geminiApiKey.trim()) {
      setGeminiStatus({ status: 'idle', message: '' });
      return;
    }
    setGeminiStatus({ status: 'checking', message: '' });
    geminiDebounce.current = setTimeout(async () => {
      setGeminiStatus(await validateGeminiKey(localSettings.geminiApiKey));
    }, 600);
    return () => clearTimeout(geminiDebounce.current);
  }, [localSettings.geminiApiKey]);

  const handleSliderChange = (value: number[]) => {
    setLocalSettings({ ...localSettings, temperature: value[0] });
  };

  const handleSave = async () => {
    setSaving(true);

    // Re-validate at save time in case the debounced check hasn't settled yet,
    // so a bad key is flagged now instead of on first real use.
    const [finalOpenai, finalGemini] = await Promise.all([
      localSettings.apiKey.trim() ? validateOpenAIKey(localSettings.apiKey) : Promise.resolve({ status: 'idle' as const, message: '' }),
      localSettings.geminiApiKey.trim() ? validateGeminiKey(localSettings.geminiApiKey) : Promise.resolve({ status: 'idle' as const, message: '' }),
    ]);
    setOpenaiStatus(finalOpenai);
    setGeminiStatus(finalGemini);
    setSaving(false);

    // Save to localStorage
    apiKeyStorage.setOpenAIApiKey(localSettings.apiKey);
    apiKeyStorage.setGeminiApiKey(localSettings.geminiApiKey);
    apiKeyStorage.setTemperature(localSettings.temperature);
    apiKeyStorage.setRetryOnError(localSettings.retryOnError);

    // Update API service with new temperature
    apiService.setTemperature(localSettings.temperature);

    // Notify parent component
    onSave(localSettings);

    if (finalOpenai.status === 'invalid' || finalGemini.status === 'invalid') {
      // Keep the dialog open so the user can see which key needs fixing
      return;
    }

    onOpenChange(false);
  };

  const renderStatus = (status: KeyValidationResult) => {
    if (status.status === 'idle') return null;
    if (status.status === 'checking') {
      return (
        <p className="text-xs flex items-center gap-1 text-gray-500 dark:text-gray-400">
          <Loader2 className="h-3 w-3 animate-spin" /> Checking key...
        </p>
      );
    }
    if (status.status === 'valid') {
      return (
        <p className="text-xs flex items-center gap-1 text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-3 w-3" /> {status.message}
        </p>
      );
    }
    if (status.status === 'invalid') {
      return (
        <p className="text-xs flex items-center gap-1 text-red-600 dark:text-red-400">
          <XCircle className="h-3 w-3" /> {status.message}
        </p>
      );
    }
    return (
      <p className="text-xs flex items-center gap-1 text-amber-600 dark:text-amber-400">
        <AlertCircle className="h-3 w-3" /> {status.message}
      </p>
    );
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
            {renderStatus(openaiStatus)}
            <p className="text-xs text-gray-500">
              Required for text/image generation using OpenAI models. Stored in your browser's local storage only.
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
            {renderStatus(geminiStatus)}
            <p className="text-xs text-gray-500">
              Required for using Google's Gemini models. Stored in your browser's local storage only.
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
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-4 w-4 animate-spin" /> Validating...
              </span>
            ) : 'Save Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
