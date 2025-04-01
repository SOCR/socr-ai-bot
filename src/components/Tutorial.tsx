
import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface Step {
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

interface TutorialProps {
  steps: Step[];
  onComplete?: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ steps, onComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const calculatePosition = (targetElement: Element, position: 'top' | 'right' | 'bottom' | 'left' = 'bottom') => {
    const rect = targetElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    let top = rect.top + scrollTop;
    let left = rect.left + scrollLeft;
    
    switch (position) {
      case 'top':
        top -= 10 + 150; // Tooltip height + offset
        left += rect.width / 2 - 150; // Center horizontally
        break;
      case 'right':
        left += rect.width + 10;
        top += rect.height / 2 - 75; // Center vertically
        break;
      case 'bottom':
        top += rect.height + 10;
        left += rect.width / 2 - 150; // Center horizontally
        break;
      case 'left':
        left -= 10 + 300; // Tooltip width + offset
        top += rect.height / 2 - 75; // Center vertically
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
      setCurrentStep(currentStep + 1);
    } else {
      setIsOpen(false);
      if (onComplete) onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onComplete) onComplete();
  };

  useEffect(() => {
    if (isOpen && steps[currentStep]) {
      const targetElement = document.querySelector(steps[currentStep].target);
      if (targetElement) {
        const pos = calculatePosition(targetElement, steps[currentStep].position);
        setPosition(pos);
        
        // Scroll target into view
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        
        // Highlight the element
        const originalStyles = targetElement.getAttribute('style') || '';
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
  }, [currentStep, isOpen, steps]);

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

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[999]" onClick={handleClose} />
      
      {/* Tutorial card */}
      <Card
        className={cn(
          "fixed z-[1000] w-[300px] p-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg",
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
