
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  status?: "default" | "danger" | "warning" | "success";
  defaultCollapsed?: boolean;
  className?: string;
  contentClassName?: string;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ 
  title, 
  children, 
  status = "default", 
  defaultCollapsed = true,
  className = "",
  contentClassName = "", 
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  
  const statusColors = {
    default: "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700",
    danger: "bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300",
    warning: "bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 dark:text-amber-300",
    success: "bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-300"
  };
  
  return (
    <div className={cn("border rounded-md mb-2 overflow-hidden dark:border-gray-700", className)}>
      <button
        className={cn(
          "w-full text-left p-3 flex justify-between items-center",
          statusColors[status]
        )}
        onClick={() => setCollapsed(!collapsed)}
        aria-expanded={!collapsed}
      >
        <span className="font-semibold">{title}</span>
        {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </button>
      <div 
        className={cn(
          "transition-all duration-300", 
          collapsed ? 'h-0 invisible' : 'visible', 
          contentClassName
        )}
      >
        <div className="p-3 dark:text-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AccordionItem;
