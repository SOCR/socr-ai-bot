import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import PromptInput from '../PromptInput';
import DataUpload from '../DataUpload';
import DatasetSelector from '../DatasetSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ControlPanelProps {
  selectedDataset: string | null;
  uploadedData: any | null;
  handleDatasetSelect: (value: string) => void;
  handleDataUpload: (data: any) => void;
  onOpenSettings: () => void;
  handleSubmit: (prompt: string) => Promise<void>;
  loading: boolean;
  demoPrompts: { value: string; label: string }[];
  datasetOptions: { value: string; label: string }[];
  onNavigateToDataTab?: () => void;
  selectedModel?: string;
  onModelChange?: (value: string) => void;
  modelOptions?: { value: string; label: string }[];
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  selectedDataset,
  uploadedData,
  handleDatasetSelect,
  handleDataUpload,
  onOpenSettings,
  handleSubmit,
  loading,
  demoPrompts,
  datasetOptions,
  onNavigateToDataTab,
  selectedModel = 'gpt-4o-mini',
  onModelChange,
  modelOptions = []
}) => {
  const hasDataLoaded = selectedDataset || uploadedData;

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <p className="font-medium dark:text-gray-200">
            Selected Dataset: {selectedDataset || (uploadedData?.name || 'None')}
          </p>
          <Button variant="link" className="p-0 dark:text-socr-lightblue" onClick={() => window.location.reload()}>
            Reset
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-2">
            <DatasetSelector onSelect={handleDatasetSelect} datasetOptions={datasetOptions} />
            
            <p className="text-sm text-center dark:text-gray-400">or</p>
            
            <DataUpload onDataUploaded={handleDataUpload} />
            
            {hasDataLoaded && onNavigateToDataTab && (
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-1 mt-2" 
                onClick={onNavigateToDataTab}
              >
                <span>View Full Dataset</span> 
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Add AI Model Selector if modelOptions are provided */}
          {modelOptions.length > 0 && onModelChange && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Select AI Model for Code Generation</label>
              <Select defaultValue={selectedModel} onValueChange={onModelChange}>
                <SelectTrigger className="w-full dark:bg-gray-700">
                  <SelectValue placeholder="Select AI Model" />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <PromptInput
            placeholder="Ask a question about your data or request a specific analysis..."
            demoPrompts={demoPrompts}
            onSubmit={handleSubmit}
            buttonText="Submit"
            isLoading={loading}
            rows={6}
            selectLabel="Select example prompt"
          />
          
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={onOpenSettings} className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
              Settings
            </Button>
          </div>
          
          <div className="text-sm text-gray-500 mt-2 dark:text-gray-400">
            <p>API Usage: 0 tokens</p>
            <p>Temperature: 0.7</p>
            <p>Auto retry on error: Yes</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ControlPanel;
