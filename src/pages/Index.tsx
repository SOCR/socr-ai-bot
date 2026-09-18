import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BasicTab from '@/components/tabs/BasicTab';
import SynthTab from '@/components/tabs/SynthTab';
import BrainGenTab from '@/components/tabs/BrainGenTab';
import DataTab from '@/components/tabs/DataTab';
import AboutTab from '@/components/tabs/AboutTab';
import SettingsDialog from '@/components/SettingsDialog';
import OnboardingDialog from '@/components/OnboardingDialog';
import apiService from '@/lib/apiService';

const Index = () => {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState('basic');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [uploadedData, setUploadedData] = useState<any | null>(null);
  const [settings, setSettings] = useState({
    apiKey: '',
    geminiApiKey: '',  // Adding geminiApiKey property
    temperature: 0.7,
    retryOnError: true,
  });
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  // App version
  const appVersion = '3.0';

  // Show the onboarding explainer once, on the user's first visit
  useEffect(() => {
    const hasVisitedBefore = localStorage.getItem('socr-first-visit');
    if (!hasVisitedBefore) {
      setOnboardingOpen(true);
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
    apiService.setTemperature(newSettings.temperature);
    
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully."
    });
  };

  // New function to handle dataset selection from BasicTab
  const handleDatasetChange = (dataset: string | null, data: any | null) => {
    setSelectedDataset(dataset);
    setUploadedData(data);
  };

  // Function to directly navigate to the data tab
  const navigateToDataTab = () => {
    setCurrentTab('data');
  };
  
  const renderCurrentTab = () => {
    switch (currentTab) {
      case 'basic':
        return (
          <BasicTab 
            onOpenSettings={handleOpenSettings} 
            onDatasetChange={handleDatasetChange}
            selectedDataset={selectedDataset}
            uploadedData={uploadedData}
            onNavigateToDataTab={navigateToDataTab}
          />
        );
      case 'synth':
        return <SynthTab />;
      case 'brain-gen':
        return <BrainGenTab />;
      case 'data':
        return <DataTab selectedDataset={selectedDataset} uploadedData={uploadedData} />;
      case 'about':
        return <AboutTab version={appVersion} />;
      default:
        return <BasicTab onOpenSettings={handleOpenSettings} />;
    }
  };

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
        onSave={handleSaveSettings}
      />

      <OnboardingDialog
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
        onOpenSettings={handleOpenSettings}
      />
    </div>
  );
};

export default Index;
