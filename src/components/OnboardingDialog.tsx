import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, KeyRound } from 'lucide-react';

interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSettings: () => void;
}

const OnboardingDialog: React.FC<OnboardingDialogProps> = ({ open, onOpenChange, onOpenSettings }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Welcome to SOCR AI Bot</DialogTitle>
          <DialogDescription>
            A quick heads-up before you start: some features work right away, others need your own API key.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800/40 dark:bg-green-900/20">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">Works with no key</p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Uploading data, browsing datasets, running R code (via WebR, entirely in your browser), and
                exploring the Data and Report tabs all work out of the box.
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800/40 dark:bg-amber-900/20">
            <KeyRound className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">Needs your OpenAI or Gemini key</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                AI-written R code (Generate), the Ask tab, and Synthetic Text/Image generation call OpenAI or
                Google's Gemini directly from your browser using a key you provide in Settings. You're only
                asked for a key the first time you use one of these.
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Your key is stored only in this browser's local storage and is never sent anywhere except directly
            to OpenAI/Google.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Maybe later</Button>
          <Button onClick={() => { onOpenChange(false); onOpenSettings(); }}>Add an API Key</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingDialog;
