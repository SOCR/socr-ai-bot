
import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

export interface Step {
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  tabId?: string; // Optional tab ID to switch to
}

interface TutorialProps {
  steps: Step[];
  onComplete?: () => void;
  currentTab?: string;
  onTabChange?: (tabId: string) => void;
}

const Tutorial: React.FC<TutorialProps> = ({ 
  steps, 
  onComplete, 
  currentTab,
  onTabChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);

  const calculatePosition = (targetElement: Element, position: 'top' | 'right' | 'bottom' | 'left' = 'bottom') => {
    const rect = targetElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    let top = rect.top + scrollTop;
    let left = rect.left + scrollLeft;
    const tooltipWidth = 320; // Slightly wider for better readability
    const tooltipHeight = 180; // Slightly taller for more content
    const windowWidth = window.innerWidth;
    
    switch (position) {
      case 'top':
        top -= tooltipHeight + 10; // Tooltip height + offset
        left += rect.width / 2 - tooltipWidth / 2; // Center horizontally
        // Ensure tooltip stays within viewport horizontally
        left = Math.max(10, Math.min(left, window.innerWidth - tooltipWidth - 10));
        break;
      case 'right':
        left += rect.width + 10;
        top += rect.height / 2 - tooltipHeight / 2; // Center vertically
        // If tooltip would go off-screen to the right, place it on the left instead
        if (left + tooltipWidth > windowWidth) {
          left = rect.left - tooltipWidth - 10;
        }
        break;
      case 'bottom':
        top += rect.height + 10;
        left += rect.width / 2 - tooltipWidth / 2; // Center horizontally
        // Ensure tooltip stays within viewport horizontally
        left = Math.max(10, Math.min(left, window.innerWidth - tooltipWidth - 10));
        break;
      case 'left':
        left -= tooltipWidth + 10;
        top += rect.height / 2 - tooltipHeight / 2; // Center vertically
        // If tooltip would go off-screen to the left, place it on the right instead
        if (left < 0) {
          left = rect.left + rect.width + 10;
        }
        break;
    }
    
    return {
      top,
      left,
      width: rect.width,
      height: rect.height
    };
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // Check if the next step is in a different tab
      const nextStep = steps[currentStep + 1];
      if (nextStep.tabId && nextStep.tabId !== currentTab && onTabChange) {
        onTabChange(nextStep.tabId);
      }
      setCurrentStep(currentStep + 1);
    } else {
      setIsOpen(false);
      if (onComplete) onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      // Check if the previous step is in a different tab
      const prevStep = steps[currentStep - 1];
      if (prevStep.tabId && prevStep.tabId !== currentTab && onTabChange) {
        onTabChange(prevStep.tabId);
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (highlightedElement) {
      // Clean up any styles on the highlighted element
      const originalStyles = highlightedElement.getAttribute('data-original-style') || '';
      highlightedElement.setAttribute('style', originalStyles);
      highlightedElement.removeAttribute('data-original-style');
    }
    if (onComplete) onComplete();
  };

  const jumpToSection = (sectionIndex: number) => {
    if (sectionIndex >= 0 && sectionIndex < steps.length) {
      const targetStep = steps[sectionIndex];
      if (targetStep.tabId && targetStep.tabId !== currentTab && onTabChange) {
        onTabChange(targetStep.tabId);
      }
      setCurrentStep(sectionIndex);
    }
  };

  // Group steps by tab for the section menu
  const getTabSections = () => {
    const sections: {[key: string]: {name: string, startIndex: number}} = {};
    
    steps.forEach((step, index) => {
      if (step.tabId && !sections[step.tabId]) {
        sections[step.tabId] = {
          name: step.tabId.charAt(0).toUpperCase() + step.tabId.slice(1).replace('-', ' '),
          startIndex: index
        };
      }
    });
    
    return sections;
  };

  useEffect(() => {
    if (isOpen && steps[currentStep]) {
      const targetElement = document.querySelector(steps[currentStep].target);
      if (targetElement) {
        // Store the current highlighted element to clean up later
        setHighlightedElement(targetElement);
        
        const pos = calculatePosition(targetElement, steps[currentStep].position);
        setPosition(pos);
        
        // Scroll target into view with some delay to ensure tab switching is complete
        setTimeout(() => {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
        
        // Save original styles and highlight the element
        const originalStyles = targetElement.getAttribute('style') || '';
        targetElement.setAttribute('data-original-style', originalStyles);
        targetElement.setAttribute(
          'style', 
          `${originalStyles}; outline: 2px solid #2386c8; outline-offset: 4px; position: relative; z-index: 1000;`
        );
        
        return () => {
          // Clean up styles when step changes
          targetElement.setAttribute('style', originalStyles);
        };
      }
    }
  }, [currentStep, isOpen, steps, currentTab]);

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-socr-darkblue dark:text-gray-200 dark:hover:bg-gray-700"
        onClick={() => setIsOpen(true)}
        aria-label="Start tutorial"
      >
        <HelpCircle size={20} />
      </Button>
    );
  }

  const sections = getTabSections();

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[999]" onClick={handleClose} />
      
      {/* Tutorial card */}
      <Card
        className={cn(
          "fixed z-[1000] w-[320px] p-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg",
          "transition-all duration-300 ease-in-out"
        )}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg dark:text-white">
            {steps[currentStep].title}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-6 w-6"
            aria-label="Close tutorial"
          >
            <X size={16} />
          </Button>
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {steps[currentStep].content}
        </p>
        
        {/* Jump to section dropdown */}
        {Object.keys(sections).length > 1 && (
          <div className="mb-3">
            <select 
              className="w-full p-2 text-sm rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              onChange={(e) => jumpToSection(parseInt(e.target.value))}
              value={currentStep}
            >
              <option value={currentStep}>Jump to section...</option>
              {Object.entries(sections).map(([tabId, section]) => (
                <option key={tabId} value={section.startIndex}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-1"
          >
            <ArrowLeft size={16} /> Previous
          </Button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentStep + 1} / {steps.length}
          </span>
          <Button
            variant="default"
            size="sm"
            onClick={handleNext}
            className="flex items-center gap-1"
          >
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'} <ArrowRight size={16} />
          </Button>
        </div>
      </Card>
    </>
  );
};

export default Tutorial;
