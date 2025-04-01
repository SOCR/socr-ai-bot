
import React from 'react';
import { Button } from '@/components/ui/button';
import { Step } from '../Tutorial';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose
} from '@/components/ui/sheet';

interface TutorialSheetProps {
  open: boolean;
  steps: Step[];
  currentStep: number;
  sections: { [key: string]: { name: string, steps: number[] } };
  onClose: () => void;
  onJumpToSection: (stepIndex: number) => void;
}

const TutorialSheet: React.FC<TutorialSheetProps> = ({
  open,
  steps,
  currentStep,
  sections,
  onClose,
  onJumpToSection
}) => {
  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] z-[1002]">
        <SheetHeader>
          <SheetTitle>Tutorial Sections</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          {Object.entries(sections).map(([tabId, section]) => (
            <div key={tabId} className="space-y-2">
              <h4 className="font-medium text-sm">{section.name}</h4>
              <div className="space-y-1 pl-2">
                {section.steps.map((stepIndex) => (
                  <Button 
                    key={stepIndex} 
                    variant="ghost" 
                    size="sm"
                    className={cn(
                      "w-full justify-start text-left text-xs",
                      currentStep === stepIndex ? "bg-muted font-medium" : ""
                    )}
                    onClick={() => {
                      onJumpToSection(stepIndex);
                      document.querySelector<HTMLButtonElement>('[data-state="open"] .close-sheet')?.click();
                    }}
                  >
                    {steps[stepIndex].title}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 right-4">
          <SheetClose className="close-sheet">
            <Button size="sm">Close</Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TutorialSheet;
