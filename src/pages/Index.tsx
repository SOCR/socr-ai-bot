
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BasicTab from '@/components/tabs/BasicTab';
import SynthTextTab from '@/components/tabs/SynthTextTab';
import SynthImagesTab from '@/components/tabs/SynthImagesTab';
import BrainGenTab from '@/components/tabs/BrainGenTab';
import DataTab from '@/components/tabs/DataTab';
import ReportTab from '@/components/tabs/ReportTab';
import EdaTab from '@/components/tabs/EdaTab';
import AskTab from '@/components/tabs/AskTab';
import AboutTab from '@/components/tabs/AboutTab';
import SettingsDialog from '@/components/SettingsDialog';
import apiService from '@/lib/apiService';

const Index = () => {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState('basic');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [uploadedData, setUploadedData] = useState<any | null>(null);
  const [settings, setSettings] = useState({
    apiKey: '',
    temperature: 0.7,
    retryOnError: true,
  });
  const [showTutorialFirstVisit, setShowTutorialFirstVisit] = useState(false);
  
  // App version
  const appVersion = '2.6.2';

  // Check if this is the user's first visit
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('socr-first-visit');
    if (!hasVisitedBefore) {
      setShowTutorialFirstVisit(true);
      localStorage.setItem('socr-first-visit', 'true');
    }
  }, []);
  
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
  };
  
  const handleOpenSettings = () => {
    setSettingsOpen(true);
  };
  
  const handleSaveSettings = (newSettings: typeof settings) => {
    setSettings(newSettings);
    apiService.setApiKey(newSettings.apiKey);
    
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully."
    });
  };
  
  const renderCurrentTab = () => {
    switch (currentTab) {
      case 'basic':
        return <BasicTab onOpenSettings={handleOpenSettings} />;
      case 'synth-text':
        return <SynthTextTab />;
      case 'synth-images':
        return <SynthImagesTab />;
      case 'brain-gen':
        return <BrainGenTab />;
      case 'data':
        return <DataTab selectedDataset={selectedDataset} uploadedData={uploadedData} />;
      case 'report':
        return <ReportTab />;
      case 'eda':
        return <EdaTab selectedDataset={selectedDataset} uploadedData={uploadedData} />;
      case 'ask':
        return <AskTab />;
      case 'about':
        return <AboutTab version={appVersion} />;
      default:
        return <BasicTab onOpenSettings={handleOpenSettings} />;
    }
  };

  // Display welcome message on first visit
  useEffect(() => {
    if (showTutorialFirstVisit) {
      toast({
        title: "Welcome to SOCR AI Bot",
        description: "Welcome! Look for the Help button in the navigation bar to start an interactive tutorial.",
        duration: 8000,
      });
    }
  }, [showTutorialFirstVisit, toast]);

  return (
    <div className="flex flex-col min-h-screen dark:bg-gray-900">
      <Navbar currentTab={currentTab} onTabChange={handleTabChange} />
      
      <main className="flex-grow">
        {renderCurrentTab()}
      </main>
      
      <Footer version={appVersion} />
      
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
};

export default Index;
