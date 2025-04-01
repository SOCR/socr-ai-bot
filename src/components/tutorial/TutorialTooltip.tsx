
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, ArrowRight, ArrowLeft, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';

interface Section {
  tabId: string;
  name: string;
  firstStep: number;
}

interface TutorialTooltipProps {
  title: string;
  content: string;
  stepNumber: number;
  totalSteps: number;
  sections: Section[];
  position: { top: number; left: number };
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onJumpToSection: (stepIndex: number) => void;
  onViewAllTutorials: () => void;
  showJumpMenu: boolean;
  setShowJumpMenu: (show: boolean) => void;
}

const TutorialTooltip: React.FC<TutorialTooltipProps> = ({
  title,
  content,
  stepNumber,
  totalSteps,
  sections,
  position,
  onClose,
  onPrevious,
  onNext,
  onJumpToSection,
  onViewAllTutorials,
  showJumpMenu,
  setShowJumpMenu
}) => {
  return (
    <Card
      className={cn(
        "fixed z-[1001] w-[320px] p-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg",
        "transition-all duration-300 ease-in-out"
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg dark:text-white">{title}</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-6 w-6"
          aria-label="Close tutorial"
        >
          <X size={16} />
        </Button>
      </div>
      
      <p className="text-gray-700 dark:text-gray-300 mb-4">{content}</p>
      
      {/* Jump to section dropdown - fixed positioning */}
      <div className="mb-4">
        <DropdownMenu open={showJumpMenu} onOpenChange={setShowJumpMenu}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full flex justify-between items-center"
            >
              <span>Jump to section</span>
              <Menu size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="start" 
            className="w-[250px] max-h-[300px] overflow-y-auto z-[1002]" 
            sideOffset={5}
          >
            {sections.map((section) => (
              <DropdownMenuItem 
                key={section.tabId}
                onClick={() => onJumpToSection(section.firstStep)}
              >
                {section.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={stepNumber === 0}
          className="flex items-center gap-1"
        >
          <ArrowLeft size={16} /> Previous
        </Button>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {stepNumber + 1} / {totalSteps}
        </span>
        <Button
          variant="default"
          size="sm"
          onClick={onNext}
          className="flex items-center gap-1"
        >
          {stepNumber === totalSteps - 1 ? 'Finish' : 'Next'} <ArrowRight size={16} />
        </Button>
      </div>
      
      {/* Quick navigation bar */}
      <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
        <Button variant="ghost" size="sm" className="w-full text-xs" onClick={onViewAllTutorials}>
          View all tutorials
        </Button>
      </div>
    </Card>
  );
};

export default TutorialTooltip;
