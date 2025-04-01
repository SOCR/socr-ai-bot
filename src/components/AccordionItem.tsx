
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  status?: "default" | "danger";
  defaultCollapsed?: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ 
  title, 
  children, 
  status = "default", 
  defaultCollapsed = true 
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  
  const statusColors = {
    default: "bg-gray-100 hover:bg-gray-200",
    danger: "bg-red-100 hover:bg-red-200 text-red-800"
  };
  
  return (
    <div className="border rounded-md mb-2 overflow-hidden">
      <button
        className={`w-full text-left p-3 flex justify-between items-center ${statusColors[status]}`}
        onClick={() => setCollapsed(!collapsed)}
      >
        <span className="font-semibold">{title}</span>
        {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </button>
      <div className={`p-3 transition-all duration-300 ${collapsed ? 'hidden' : 'block'}`}>
        {children}
      </div>
    </div>
  );
};

export default AccordionItem;
