
export const calculatePosition = (
  targetElement: Element, 
  position: 'top' | 'right' | 'bottom' | 'left' = 'bottom',
  tooltipSize: { width: number, height: number }
) => {
  const rect = targetElement.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
  // Get window dimensions
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  // Get tooltip dimensions
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

export default calculatePosition;
