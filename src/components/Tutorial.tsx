
import { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, ArrowLeft, HelpCircle, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';

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
  const [tooltipSize, setTooltipSize] = useState({ width: 320, height: 220 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [showJumpMenu, setShowJumpMenu] = useState(false);
  
  // Group steps by tab for the section menu
  const getTabSections = () => {
    const sections: {[key: string]: {name: string, steps: number[]}} = {};
    
    steps.forEach((step, index) => {
      if (step.tabId) {
        if (!sections[step.tabId]) {
          sections[step.tabId] = {
            name: step.tabId.charAt(0).toUpperCase() + step.tabId.slice(1).replace('-', ' '),
            steps: []
          };
        }
        sections[step.tabId].steps.push(index);
      }
    });
    
    return sections;
  };
  
  const sections = getTabSections();

  const calculatePosition = (targetElement: Element, position: 'top' | 'right' | 'bottom' | 'left' = 'bottom') => {
    const rect = targetElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // Get window dimensions
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Get tooltip dimensions from ref or use defaults
    const tooltipWidth = tooltipSize.width;
    const tooltipHeight = tooltipSize.height;
    
    let top = rect.top + scrollTop;
    let left = rect.left + scrollLeft;
    
    // Add padding for visual separation
    const padding = 12;
    
    // Calculate position based on specified position
    switch (position) {
      case 'top':
        top = rect.top + scrollTop - tooltipHeight - padding;
        left = rect.left + scrollLeft + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'right':
        left = rect.left + scrollLeft + rect.width + padding;
        top = rect.top + scrollTop + rect.height / 2 - tooltipHeight / 2;
        break;
      case 'bottom':
        top = rect.top + scrollTop + rect.height + padding;
        left = rect.left + scrollLeft + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        left = rect.left + scrollLeft - tooltipWidth - padding;
        top = rect.top + scrollTop + rect.height / 2 - tooltipHeight / 2;
        break;
    }
    
    // Ensure tooltip stays within viewport bounds
    // Check if tooltip would go off the right side of the window
    if (left + tooltipWidth > windowWidth - padding) {
      left = windowWidth - tooltipWidth - padding;
    }
    
    // Check if tooltip would go off the left side of the window
    if (left < padding) {
      left = padding;
    }
    
    // Check if tooltip would go off the bottom of the window
    if (top + tooltipHeight > windowHeight + scrollTop - padding) {
      // Try to place it above instead
      const topAbove = rect.top + scrollTop - tooltipHeight - padding;
      if (topAbove > scrollTop + padding) {
        top = topAbove;
      } else {
        // If above doesn't work either, place it where it fits best
        top = windowHeight + scrollTop - tooltipHeight - padding;
      }
    }
    
    // Check if tooltip would go off the top of the window
    if (top < scrollTop + padding) {
      top = scrollTop + padding;
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
      handleClose();
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
    cleanupHighlight();
    if (onComplete) onComplete();
  };

  const cleanupHighlight = () => {
    // Clean up any styles on the highlighted element
    if (highlightedElement) {
      const originalStyles = highlightedElement.getAttribute('data-original-style') || '';
      highlightedElement.setAttribute('style', originalStyles);
      highlightedElement.removeAttribute('data-original-style');
      document.querySelectorAll('.tutorial-overlay').forEach(el => el.remove());
    }
  };

  const jumpToSection = (sectionIndex: number) => {
    if (sectionIndex >= 0 && sectionIndex < steps.length) {
      const targetStep = steps[sectionIndex];
      if (targetStep.tabId && targetStep.tabId !== currentTab && onTabChange) {
        onTabChange(targetStep.tabId);
      }
      setCurrentStep(sectionIndex);
      setShowJumpMenu(false);
    }
  };

  // Enhanced highlighting with overlay
  const highlightElement = (targetElement: Element) => {
    cleanupHighlight();
    
    const rect = targetElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // Save original styles
    const originalStyles = targetElement.getAttribute('style') || '';
    targetElement.setAttribute('data-original-style', originalStyles);
    
    // Apply highlight styles - we'll use a relative position and z-index
    // but avoid changing the original layout
    targetElement.setAttribute(
      'style', 
      `${originalStyles}; position: relative; z-index: 1000;`
    );
    
    // Create a highlight effect with a pulse animation
    const overlay = document.createElement('div');
    overlay.className = 'tutorial-overlay';
    overlay.style.position = 'absolute';
    overlay.style.top = `${rect.top + scrollTop}px`;
    overlay.style.left = `${rect.left + scrollLeft}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    overlay.style.boxShadow = '0 0 0 4px rgba(35, 134, 200, 0.8)';
    overlay.style.borderRadius = '4px';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '999';
    overlay.style.animation = 'pulse 2s infinite';
    
    document.body.appendChild(overlay);
    
    // Add keyframe animation for the pulse effect
    const style = document.createElement('style');
    style.className = 'tutorial-overlay';
    style.textContent = `
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(35, 134, 200, 0.8); }
        70% { box-shadow: 0 0 0 6px rgba(35, 134, 200, 0.0); }
        100% { box-shadow: 0 0 0 0 rgba(35, 134, 200, 0.0); }
      }
    `;
    document.head.appendChild(style);
  };

  useEffect(() => {
    if (isOpen && steps[currentStep]) {
      // Slight delay to ensure tab switching is complete
      const timer = setTimeout(() => {
        const targetElement = document.querySelector(steps[currentStep].target);
        if (targetElement) {
          // Store the current highlighted element to clean up later
          setHighlightedElement(targetElement);
          
          // Enhanced highlighting
          highlightElement(targetElement);
          
          // Calculate tooltip position
          const pos = calculatePosition(targetElement, steps[currentStep].position);
          setPosition(pos);
          
          // Scroll target into view with smooth behavior
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          
          // Update tooltip size from ref
          if (tooltipRef.current) {
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            setTooltipSize({ 
              width: tooltipRect.width, 
              height: tooltipRect.height 
            });
          }
        }
      }, 300); // Delay to ensure tab switching is complete
      
      return () => {
        clearTimeout(timer);
        cleanupHighlight();
      };
    }
  }, [currentStep, isOpen, steps, currentTab]);

  // Update position when tooltip size changes
  useEffect(() => {
    if (highlightedElement && tooltipRef.current) {
      const pos = calculatePosition(highlightedElement, steps[currentStep].position);
      setPosition(pos);
    }
  }, [tooltipSize]);

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

  // Create a list of all major sections for the jump menu
  const allSections = Object.entries(sections).map(([tabId, section]) => ({
    tabId,
    name: section.name,
    firstStep: section.steps[0]
  }));

  return (
    <>
      {/* Semi-transparent overlay */}
      <div className="fixed inset-0 bg-black/30 z-[999]" onClick={handleClose} />
      
      {/* Tutorial card */}
      <Card
        ref={tooltipRef}
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
            <DropdownMenuContent align="center" className="w-[250px] max-h-[300px] overflow-y-auto">
              {allSections.map((section) => (
                <DropdownMenuItem 
                  key={section.tabId}
                  onClick={() => jumpToSection(section.firstStep)}
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
        
        {/* Quick navigation bar */}
        <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full text-xs">
                View all tutorials
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[300px] sm:w-[400px]">
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
                            jumpToSection(stepIndex);
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
        </div>
      </Card>
    </>
  );
};

export default Tutorial;
