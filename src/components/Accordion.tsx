
import React from 'react';

interface AccordionProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

const Accordion: React.FC<AccordionProps> = ({ id, children, className = '' }) => {
  return (
    <div id={id} className={`space-y-2 ${className}`}>
      {children}
    </div>
  );
};

export default Accordion;
