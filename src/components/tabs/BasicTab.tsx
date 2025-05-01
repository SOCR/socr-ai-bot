
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { listDatasets, fetchDataset } from '@/lib/webr';
import FeedbackForm from '../FeedbackForm';
import apiService from '@/lib/apiService';
import { demoQuestions } from '@/lib/demoData';
import BasicTabHeader from '../basic/BasicTabHeader';
import CodeResultDisplay from '../basic/CodeResultDisplay';
import ControlPanel from '../basic/ControlPanel';

interface BasicTabProps {
  onOpenSettings: () => void;
}

const BasicTab: React.FC<BasicTabProps> = ({ onOpenSettings }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<null | {
    code: string;
    output: string;
    error?: string;
    plot?: string;
  }>(null);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [uploadedData, setUploadedData] = useState<any | null>(null);
  const [datasetOptions, setDatasetOptions] = useState<{ value: string; label: string }[]>([]);
  
  const handleSubmit = async (inputPrompt: string) => {
    if (!inputPrompt.trim()) return;
    
    setPrompt(inputPrompt);
    setLoading(true);
    
    try {
      // In a real implementation, this would actually execute R code on a backend server
      const response = await apiService.executeRCode(
        `# R code to analyze data based on prompt: "${inputPrompt}"
library(ggplot2)

# Simple data analysis
summary(df)

# Create a visualization
ggplot(df, aes(x = factor(cyl), y = mpg)) +
  geom_boxplot() +
  labs(title = "MPG by Number of Cylinders",
       x = "Cylinders",
       y = "Miles Per Gallon")`,
        selectedDataset || uploadedData
      );
      
      if (response.success) {
        setResult({
          code: `# R code for: "${inputPrompt}"\nlibrary(ggplot2)\n\n# Simple data analysis\nsummary(df)\n\n# Create a visualization\nggplot(df, aes(x = factor(cyl), y = mpg)) +\n  geom_boxplot() +\n  labs(title = "MPG by Number of Cylinders",\n       x = "Cylinders",\n       y = "Miles Per Gallon")`,
          output: "Here's a summary of the data and a visualization showing the relationship between cylinders and MPG.",
          plot: 'https://mdn.github.io/dom-examples/canvas/pixel-manipulation/bicycle.png' // Example placeholder image
        });
      } else {
        setResult({
          code: `# Attempted R code for: "${inputPrompt}"`,
          output: "",
          error: response.error || 'An unknown error occurred'
        });
        toast({
          title: "Error",
          description: response.error || 'An unknown error occurred',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error submitting prompt:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive"
      });
      setResult({
        code: `# Attempted R code for: "${inputPrompt}"`,
        output: "",
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // const handleDatasetSelect = (value: string) => {
  //   setSelectedDataset(value);
  //   setUploadedData(null);
  //   toast({
  //     title: "Dataset Selected",
  //     description: `Using the ${value} dataset`
  //   });
  // };

  const handleDatasetSelect = async (value: string) => {
    setLoading(true);
    try {
    const rows = await fetchDataset(value);          // grab the whole frame
    setSelectedDataset(value);
    setUploadedData(rows);                           // reuse existing prop
    toast({
    title: "Dataset Selected",
    description: `Loaded ${value} (${rows.length} rows)`
    });
    } catch (err) {
    console.error(err);
    toast({
    title: "Error",
    description: "Could not load dataset",
    variant: "destructive"
    });
    } finally {
    setLoading(false);
    }
  };
  
  
  const handleDataUpload = (data: any) => {
    setUploadedData(data);
    setSelectedDataset(null);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar */}
        <div className="md:col-span-1 space-y-4">
          <ControlPanel
            selectedDataset={selectedDataset}
            uploadedData={uploadedData}
            handleDatasetSelect={handleDatasetSelect}
            handleDataUpload={handleDataUpload}
            onOpenSettings={onOpenSettings}
            handleSubmit={handleSubmit}
            loading={loading}
            demoPrompts={demoQuestions}
          />
          
          <FeedbackForm />
        </div>
        
        {/* Main content area */}
        <div className="md:col-span-2 space-y-4">
          {!result ? (
            <BasicTabHeader />
          ) : (
            <CodeResultDisplay result={result} />
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicTab;
