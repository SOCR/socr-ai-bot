
import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TutorialHighlight from './tutorial/TutorialHighlight';
import TutorialTooltip from './tutorial/TutorialTooltip';
import TutorialSheet from './tutorial/TutorialSheet';
import calculatePosition from './tutorial/TutorialPositioner';

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
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);
  const [tooltipSize, setTooltipSize] = useState({ width: 320, height: 220 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [showJumpMenu, setShowJumpMenu] = useState(false);
  const [showAllTutorials, setShowAllTutorials] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const maxAttempts = 20; // Maximum number of attempts to find an element
  
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
  
  // Create a list of all major sections for the jump menu
  const allSections = Object.entries(sections).map(([tabId, section]) => ({
    tabId,
    name: section.name,
    firstStep: section.steps[0]
  }));

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // Check if the next step is in a different tab
      const nextStep = steps[currentStep + 1];
      if (nextStep.tabId && nextStep.tabId !== currentTab && onTabChange) {
        onTabChange(nextStep.tabId);
      }
      setCurrentStep(currentStep + 1);
      setAttemptCount(0); // Reset attempt counter for new step
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
      setAttemptCount(0); // Reset attempt counter for new step
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
      
      // Remove the overlay elements
      document.querySelectorAll('.tutorial-overlay').forEach(el => el.remove());
      document.querySelectorAll('.tutorial-highlight-mask').forEach(el => el.remove());
    }
    setHighlightedElement(null);
  };

  const jumpToSection = (sectionIndex: number) => {
    setShowJumpMenu(false);
    if (sectionIndex >= 0 && sectionIndex < steps.length) {
      const targetStep = steps[sectionIndex];
      if (targetStep.tabId && targetStep.tabId !== currentTab && onTabChange) {
        onTabChange(targetStep.tabId);
        // Small delay to allow tab change before continuing
        setTimeout(() => {
          setCurrentStep(sectionIndex);
          setAttemptCount(0); // Reset attempt counter for new step
        }, 500); // Increased delay for tab switching
      } else {
        setCurrentStep(sectionIndex);
        setAttemptCount(0); // Reset attempt counter for new step
      }
    }
  };
  
  // Function to find and highlight the target element with retries
  const findAndHighlightTarget = () => {
    if (!isOpen || !steps[currentStep]) return;
    
    const targetSelector = steps[currentStep].target;
    const targetElement = document.querySelector(targetSelector);
    
    if (targetElement) {
      // Element found - clean up previous highlight and highlight the new element
      cleanupHighlight();
      setHighlightedElement(targetElement);
      
      // Calculate tooltip position
      const pos = calculatePosition(
        targetElement, 
        steps[currentStep].position, 
        tooltipSize
      );
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
      
      // Reset attempt counter on success
      setAttemptCount(0);
    } else if (attemptCount < maxAttempts) {
      // Element not found yet - retry with incrementing delay
      const delay = Math.min(100 + attemptCount * 50, 1000); // Gradually increase delay up to 1s
      
      setTimeout(() => {
        setAttemptCount(prev => prev + 1);
      }, delay);
    }
  };

  // Effect for tab switching and element highlighting
  useEffect(() => {
    if (isOpen && steps[currentStep] && attemptCount < maxAttempts) {
      const tabDelay = steps[currentStep].tabId !== currentTab ? 500 : 100;
      
      const timer = setTimeout(() => {
        findAndHighlightTarget();
      }, tabDelay);
      
      return () => clearTimeout(timer);
    }
  }, [currentStep, isOpen, steps, currentTab, attemptCount]);

  // Update position when tooltip size changes
  useEffect(() => {
    if (highlightedElement && steps[currentStep]) {
      const pos = calculatePosition(
        highlightedElement, 
        steps[currentStep].position, 
        tooltipSize
      );
      setPosition(pos);
    }
  }, [tooltipSize, highlightedElement, currentStep, steps]);

  // Listen for window resize to reposition tooltip
  useEffect(() => {
    const handleResize = () => {
      if (highlightedElement && steps[currentStep]) {
        const pos = calculatePosition(
          highlightedElement, 
          steps[currentStep].position, 
          tooltipSize
        );
        setPosition(pos);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [highlightedElement, currentStep, steps, tooltipSize]);

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
      {/* Semi-transparent overlay */}
      <div className="fixed inset-0 bg-black/30 z-[999]" onClick={handleClose} />
      
      {/* Highlight effect for the current step's target */}
      <TutorialHighlight targetElement={highlightedElement} />
      
      {/* Tutorial tooltip */}
      <div ref={tooltipRef}>
        <TutorialTooltip
          title={steps[currentStep].title}
          content={steps[currentStep].content}
          stepNumber={currentStep}
          totalSteps={steps.length}
          sections={allSections}
          position={position}
          onClose={handleClose}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onJumpToSection={jumpToSection}
          onViewAllTutorials={() => setShowAllTutorials(true)}
          showJumpMenu={showJumpMenu}
          setShowJumpMenu={setShowJumpMenu}
        />
      </div>
      
      {/* All tutorials sheet */}
      <TutorialSheet
        open={showAllTutorials}
        steps={steps}
        currentStep={currentStep}
        sections={sections}
        onClose={() => setShowAllTutorials(false)}
        onJumpToSection={jumpToSection}
      />
    </>
  );
};

export default Tutorial;
