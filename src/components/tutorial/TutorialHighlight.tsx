
import React, { useEffect } from 'react';

interface TutorialHighlightProps {
  targetElement: Element | null;
}

const TutorialHighlight: React.FC<TutorialHighlightProps> = ({ targetElement }) => {
  useEffect(() => {
    if (!targetElement) return;
    
    const cleanupHighlight = () => {
      // Clean up any styles on the highlighted element
      if (targetElement) {
        const originalStyles = targetElement.getAttribute('data-original-style') || '';
        targetElement.setAttribute('style', originalStyles);
        targetElement.removeAttribute('data-original-style');
        
        // Remove the overlay elements
        document.querySelectorAll('.tutorial-overlay').forEach(el => el.remove());
        document.querySelectorAll('.tutorial-highlight-mask').forEach(el => el.remove());
      }
    };
    
    // Apply highlight effect
    highlightElement(targetElement);
    
    return cleanupHighlight;
  }, [targetElement]);
  
  const highlightElement = (targetElement: Element) => {
    // Save original styles
    const originalStyles = targetElement.getAttribute('style') || '';
    targetElement.setAttribute('data-original-style', originalStyles);
    
    // Apply highlight styles - we'll use a relative position and z-index
    // but avoid changing the original layout
    targetElement.setAttribute(
      'style', 
      `${originalStyles}; position: relative; z-index: 1000;`
    );
    
    const rect = targetElement.getBoundingClientRect();
    
    // Create a spotlight effect with masks
    // Top mask
    const createMask = (top: number, left: number, width: number, height: number, className: string) => {
      const mask = document.createElement('div');
      mask.className = className;
      mask.style.position = 'fixed';
      mask.style.top = `${top}px`;
      mask.style.left = `${left}px`;
      mask.style.width = `${width}px`;
      mask.style.height = `${height}px`;
      mask.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      mask.style.zIndex = '998';
      mask.style.pointerEvents = 'none';
      document.body.appendChild(mask);
    };
    
    // Create four masks to create a "spotlight" effect
    // Top mask
    createMask(0, 0, window.innerWidth, rect.top, 'tutorial-highlight-mask');
    // Bottom mask
    createMask(rect.bottom, 0, window.innerWidth, window.innerHeight - rect.bottom, 'tutorial-highlight-mask');
    // Left mask
    createMask(rect.top, 0, rect.left, rect.height, 'tutorial-highlight-mask');
    // Right mask
    createMask(rect.top, rect.right, window.innerWidth - rect.right, rect.height, 'tutorial-highlight-mask');
    
    // Create a highlight effect with a pulse animation
    const overlay = document.createElement('div');
    overlay.className = 'tutorial-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = `${rect.top}px`;
    overlay.style.left = `${rect.left}px`;
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
        70% { box-shadow: 0 0 0 8px rgba(35, 134, 200, 0.0); }
        100% { box-shadow: 0 0 0 0 rgba(35, 134, 200, 0.0); }
      }
    `;
    document.head.appendChild(style);
  };
  
  return null; // This is a non-visual component that just handles the highlighting
};

export default TutorialHighlight;
