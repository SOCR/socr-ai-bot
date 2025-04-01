
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const tabs = [
    { id: "basic", label: "Basic" },
    { id: "synth-text", label: "Synth Text" },
    { id: "synth-images", label: "Synth Images" },
    { id: "brain-gen", label: "Synthetic Brain Data Generator" },
    { id: "data", label: "Data" },
    { id: "report", label: "Report" },
    { id: "eda", label: "EDA" },
    { id: "ask", label: "Ask" },
    { id: "about", label: "About" }
  ];
  
  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    setMenuOpen(false);
  };
  
  return (
    <nav className="bg-socr-blue text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center">
            <h1 className="text-xl font-bold mr-4">SOCR AI Bot</h1>
            <Button 
              variant="ghost"
              className="md:hidden text-white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu />
            </Button>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "px-3 py-2 rounded-md",
                  currentTab === tab.id 
                    ? "bg-white text-socr-blue font-semibold" 
                    : "text-white hover:bg-socr-darkblue"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden py-2 pb-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "block w-full text-left px-3 py-2 rounded-md mb-1",
                  currentTab === tab.id 
                    ? "bg-white text-socr-blue font-semibold" 
                    : "text-white hover:bg-socr-darkblue"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
