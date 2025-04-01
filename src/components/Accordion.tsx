
import React from 'react';

interface AccordionProps {
  id: string;
  children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ id, children }) => {
  return (
    <div id={id} className="space-y-2">
      {children}
    </div>
  );
};

export default Accordion;
