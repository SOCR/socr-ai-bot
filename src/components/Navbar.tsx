
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from './ThemeToggle';
import Tutorial from './Tutorial';
import { Step } from './Tutorial';

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

  // Tutorial steps with comprehensive coverage of all components
  const tutorialSteps: Step[] = [
    // Welcome & Navigation
    {
      target: '.navbar-logo',
      title: 'Welcome to SOCR AI Bot',
      content: 'This tutorial will guide you through all features of the SOCR AI Bot application. Use the navigation buttons below to move through the tutorial.',
      position: 'bottom'
    },
    
    // Basic Tab - Overview
    {
      target: '#basic-tab',
      title: 'Basic Tab Overview',
      content: 'The Basic tab is your starting point for data analysis. Let\'s explore its features.',
      position: 'bottom',
      tabId: 'basic'
    },
    {
      target: '.container .card:first-child',
      title: 'Data Selection Panel',
      content: 'This panel allows you to select a demo dataset or upload your own data for analysis.',
      position: 'right',
      tabId: 'basic'
    },
    {
      target: '[class*="DatasetSelector"]',
      title: 'Dataset Selector',
      content: 'Choose from pre-loaded demo datasets for quick analysis and exploration.',
      position: 'right',
      tabId: 'basic'
    },
    {
      target: '[class*="DataUpload"]',
      title: 'Data Upload',
      content: 'Upload your own data files in CSV, JSON, or Excel formats for custom analysis.',
      position: 'right',
      tabId: 'basic'
    },
    {
      target: '[class*="PromptInput"]',
      title: 'Prompt Input',
      content: 'Ask questions about your data or request specific analyses using natural language prompts.',
      position: 'top',
      tabId: 'basic'
    },
    {
      target: '[class*="CodeBlock"]',
      title: 'Code Exploration',
      content: 'View and copy generated code to reproduce analyses in your own environment.',
      position: 'left',
      tabId: 'basic'
    },
    {
      target: '[class*="AccordionItem"]',
      title: 'Results Accordion',
      content: 'Expand and collapse different sections of analysis results for better organization.',
      position: 'left',
      tabId: 'basic'
    },
    {
      target: '[class*="FeedbackForm"]',
      title: 'Feedback Form',
      content: 'Share your feedback and suggestions to help improve the SOCR AI Bot.',
      position: 'top',
      tabId: 'basic'
    },
    {
      target: '.md\\:col-span-2',
      title: 'Results Area',
      content: 'View analysis results, visualizations, and AI-generated code in this area.',
      position: 'left',
      tabId: 'basic'
    },
    
    // Synth Text Tab
    {
      target: '#synth-text-tab',
      title: 'Synthetic Text Generation',
      content: 'Generate AI-written text based on your prompts. Requires an OpenAI API key.',
      position: 'bottom',
      tabId: 'synth-text'
    },
    {
      target: '.container .card:first-child',
      title: 'Text Generation Prompt',
      content: 'Enter your prompt or choose from example prompts to generate synthetic text content.',
      position: 'top',
      tabId: 'synth-text'
    },
    {
      target: '.container .card:nth-child(2)',
      title: 'Generated Text Output',
      content: 'View the AI-generated text results from your prompt here.',
      position: 'top',
      tabId: 'synth-text'
    },
    
    // Synth Images Tab
    {
      target: '#synth-images-tab',
      title: 'Synthetic Image Generation',
      content: 'Create AI-generated images from text descriptions. Requires an OpenAI API key.',
      position: 'bottom',
      tabId: 'synth-images'
    },
    {
      target: '.container .max-w-3xl .card:first-child',
      title: 'Image Generation Interface',
      content: 'Enter text prompts and adjust settings to generate images that match your description.',
      position: 'right',
      tabId: 'synth-images'
    },
    {
      target: '.container .max-w-3xl [class*="Select"]',
      title: 'Image Settings',
      content: 'Configure image resolution, size, and style preferences for your generated images.',
      position: 'right',
      tabId: 'synth-images'
    },
    {
      target: '.container .max-w-3xl .grid',
      title: 'Image Gallery',
      content: 'View your generated images. Click on an image to see it in full size or download it.',
      position: 'top',
      tabId: 'synth-images'
    },
    
    // Brain Gen Tab
    {
      target: '#brain-gen-tab',
      title: 'Brain Data Generator',
      content: 'Generate synthetic brain imaging data for research and educational purposes.',
      position: 'bottom',
      tabId: 'brain-gen'
    },
    {
      target: '.container .card:first-child',
      title: 'Brain Data Parameters',
      content: 'Configure parameters for generating synthetic brain imaging data, such as resolution and modality.',
      position: 'top', 
      tabId: 'brain-gen'
    },
    {
      target: '.container .card:first-child [class*="Tabs"]',
      title: 'Parameter Categories',
      content: 'Switch between different categories of brain imaging parameters to customize your synthetic data.',
      position: 'top',
      tabId: 'brain-gen'
    },
    {
      target: '.container .card:nth-child(2)',
      title: 'Generated Brain Images',
      content: 'View and download the generated synthetic brain image data in various formats.',
      position: 'bottom',
      tabId: 'brain-gen'
    },
    
    // Data Tab
    {
      target: '#data-tab',
      title: 'Data Tab',
      content: 'View and explore your dataset in a tabular format with sorting and filtering options.',
      position: 'bottom',
      tabId: 'data'
    },
    {
      target: '.container .card:first-child',
      title: 'Data Table',
      content: 'View your selected or uploaded dataset in a sortable, filterable table format.',
      position: 'right',
      tabId: 'data'
    },
    {
      target: '[class*="DataTable"]',
      title: 'Interactive Data Table',
      content: 'Sort columns, search data, and navigate through pages to explore your dataset in detail.',
      position: 'top',
      tabId: 'data'
    },
    {
      target: '[class*="DataTable"] .flex.items-center.justify-between',
      title: 'Pagination Controls',
      content: 'Navigate between pages of data and adjust how many rows are displayed at once.',
      position: 'top',
      tabId: 'data'
    },
    
    // Report Tab
    {
      target: '#report-tab',
      title: 'Report Tab',
      content: 'Generate comprehensive reports from your analyses in various formats.',
      position: 'bottom',
      tabId: 'report'
    },
    {
      target: '.container .max-w-4xl .card:first-child',
      title: 'Report Configuration',
      content: 'Choose report type, content sections, and format options for your generated reports.',
      position: 'top',
      tabId: 'report'
    },
    {
      target: '.container .max-w-4xl .flex.gap-4',
      title: 'Report Actions',
      content: 'Generate, preview, and download reports in various formats like PDF, HTML, or Word.',
      position: 'top',
      tabId: 'report'
    },
    
    // EDA Tab
    {
      target: '#eda-tab',
      title: 'Exploratory Data Analysis',
      content: 'Perform Exploratory Data Analysis with visualizations like histograms, scatter plots, and more.',
      position: 'bottom',
      tabId: 'eda'
    },
    {
      target: '.container .card:first-child',
      title: 'EDA Visualization Tools',
      content: 'Create various visualization types to explore relationships and patterns in your data.',
      position: 'right',
      tabId: 'eda'
    },
    {
      target: '.container .card:first-child [class*="Select"]',
      title: 'Visualization Type Selection',
      content: 'Choose from different visualization types like histograms, scatter plots, box plots, and more.',
      position: 'top',
      tabId: 'eda'
    },
    {
      target: '.container .card:first-child .grid',
      title: 'Variable Selection',
      content: 'Select which variables from your dataset to include in your visualizations.',
      position: 'right',
      tabId: 'eda'
    },
    {
      target: '.container .card:nth-child(2)',
      title: 'Visualization Output',
      content: 'View the generated visualizations and gain insights into your data patterns and distributions.',
      position: 'top',
      tabId: 'eda'
    },
    
    // Ask Tab
    {
      target: '#ask-tab',
      title: 'Ask AI',
      content: 'Ask questions about statistics, data science, or get help interpreting your results.',
      position: 'bottom', 
      tabId: 'ask'
    },
    {
      target: '.container .max-w-4xl .card:first-child',
      title: 'AI Question Interface',
      content: 'Select an AI model and ask questions related to statistics, data science, or your analysis results.',
      position: 'top',
      tabId: 'ask'
    },
    {
      target: '.container .max-w-4xl .card:first-child [class*="Select"]',
      title: 'AI Model Selection',
      content: 'Choose from different AI models, each with varying capabilities and response speeds.',
      position: 'top',
      tabId: 'ask'
    },
    {
      target: '.container .max-w-4xl .card:first-child textarea',
      title: 'Question Input',
      content: 'Type your statistical or data science question here. Be specific for the best results.',
      position: 'top',
      tabId: 'ask'
    },
    {
      target: '.container .max-w-4xl .card:nth-child(2)',
      title: 'AI Response',
      content: 'View the AI\'s answer to your question, which may include explanations, formulas, or code snippets.',
      position: 'top',
      tabId: 'ask'
    },
    
    // About Tab
    {
      target: '#about-tab',
      title: 'About',
      content: 'Learn more about the SOCR project, its mission, and the team behind this application.',
      position: 'bottom',
      tabId: 'about'
    },
    {
      target: '.container .prose h2',
      title: 'About SOCR',
      content: 'Read about the Statistical Online Computational Resource (SOCR) project, its history, and mission.',
      position: 'top',
      tabId: 'about'
    },
    {
      target: '.container .prose ul',
      title: 'SOCR Resources',
      content: 'Explore links to additional SOCR resources, publications, and educational materials.',
      position: 'top',
      tabId: 'about'
    },
    {
      target: '.container .card',
      title: 'Version Information',
      content: 'View version details and update history for the SOCR AI Bot application.',
      position: 'top',
      tabId: 'about'
    },
    
    // Theme and Help
    {
      target: '#theme-toggle',
      title: 'Theme Toggle',
      content: 'Toggle between light and dark mode for your visual comfort.',
      position: 'left'
    },
    {
      target: '#help-button',
      title: 'Help Button',
      content: 'You can always restart this tutorial by clicking this help button.',
      position: 'left'
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
              <Tutorial 
                steps={tutorialSteps} 
                currentTab={currentTab}
                onTabChange={handleTabClick}
              />
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
