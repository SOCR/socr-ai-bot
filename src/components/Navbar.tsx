
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from './ThemeToggle';
import Tutorial from './Tutorial';

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

  const tutorialSteps = [
    {
      target: '.navbar-logo',
      title: 'Welcome to SOCR AI Bot',
      content: 'This tutorial will guide you through the main features of the SOCR AI Bot application.',
      position: 'bottom' as const
    },
    {
      target: '#basic-tab',
      title: 'Basic Tab',
      content: 'Start here to analyze your data. Upload a dataset or choose from our demo datasets.',
      position: 'bottom' as const
    },
    {
      target: '#synth-text-tab',
      title: 'Synthetic Text',
      content: 'Generate AI-written text based on your prompts. Requires an API key.',
      position: 'bottom' as const
    },
    {
      target: '#synth-images-tab',
      title: 'Synthetic Images',
      content: 'Create AI-generated images from text descriptions. Requires an API key.',
      position: 'bottom' as const
    },
    {
      target: '#data-tab',
      title: 'Data Tab',
      content: 'View and explore your dataset in a tabular format.',
      position: 'bottom' as const
    },
    {
      target: '#report-tab',
      title: 'Report Tab',
      content: 'Generate reports from your analyses in various formats.',
      position: 'bottom' as const
    },
    {
      target: '#theme-toggle',
      title: 'Dark Mode',
      content: 'Toggle between light and dark mode for your visual comfort.',
      position: 'left' as const
    },
    {
      target: '#help-button',
      title: 'Help',
      content: 'You can always restart this tutorial by clicking this help button.',
      position: 'left' as const
    }
  ];
  
  return (
    <nav className="bg-socr-blue text-white shadow-md dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center">
            <div className="navbar-logo flex items-center mr-4">
              <img 
                src="/lovable-uploads/2ee5da75-de6a-4182-be30-93984b17ea5d.png"
                alt="SOCR Logo" 
                className="h-8 w-auto mr-2" 
              />
              <h1 className="text-xl font-bold">SOCR AI Bot</h1>
            </div>
            <Button 
              variant="ghost"
              className="md:hidden text-white dark:text-gray-200"
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
                id={`${tab.id}-tab`}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "px-3 py-2 rounded-md transition-colors",
                  currentTab === tab.id 
                    ? "bg-white text-socr-blue font-semibold dark:bg-gray-800 dark:text-socr-blue" 
                    : "text-white hover:bg-socr-darkblue dark:hover:bg-gray-700"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Theme Toggle and Tutorial buttons */}
          <div className="flex items-center space-x-1">
            <span id="theme-toggle">
              <ThemeToggle />
            </span>
            <span id="help-button">
              <Tutorial steps={tutorialSteps} />
            </span>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden py-2 pb-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                id={`${tab.id}-tab-mobile`}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "block w-full text-left px-3 py-2 rounded-md mb-1 transition-colors",
                  currentTab === tab.id 
                    ? "bg-white text-socr-blue font-semibold dark:bg-gray-800 dark:text-socr-blue" 
                    : "text-white hover:bg-socr-darkblue dark:hover:bg-gray-700"
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
