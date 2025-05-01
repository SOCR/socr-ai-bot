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
  onDatasetChange?: (dataset: string | null, data: any | null) => void;
  selectedDataset?: string | null;
  uploadedData?: any | null;
  onNavigateToDataTab?: () => void;
}

const BasicTab: React.FC<BasicTabProps> = ({ 
  onOpenSettings, 
  onDatasetChange,
  selectedDataset: propSelectedDataset,
  uploadedData: propUploadedData,
  onNavigateToDataTab
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<null | {
    code: string;
    output: string;
    error?: string;
    plot?: string;
    datasetSummary?: string;
    datasetRows?: any[];
  }>(null);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(propSelectedDataset || null);
  const [uploadedData, setUploadedData] = useState<any | null>(propUploadedData || null);
  const [datasetOptions, setDatasetOptions] = useState<{ value: string; label: string }[]>([]);
  
  // Use the props if they're passed in
  useEffect(() => {
    if (propSelectedDataset !== undefined) {
      setSelectedDataset(propSelectedDataset);
    }
    if (propUploadedData !== undefined) {
      setUploadedData(propUploadedData);
    }
  }, [propSelectedDataset, propUploadedData]);

  // Fetch available R datasets when component mounts
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        setLoading(true);
        const datasets = await listDatasets();
        setDatasetOptions(datasets);
      } catch (error) {
        console.error('Error fetching datasets:', error);
        toast({
          title: "Error",
          description: "Failed to load R datasets",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDatasets();
  }, [toast]);
  
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

  const handleDatasetSelect = async (value: string) => {
    setLoading(true);
    try {
      const result = await fetchDataset(value);
      
      // Update local state
      setSelectedDataset(value);
      
      // Create a structured object with metadata
      const uploadedDataObj = {
        name: value,
        data: result.rows,
        rows: result.rows.length,
        columns: result.rows.length > 0 ? Object.keys(result.rows[0] || {}).length : 0,
        summary: result.summary
      };
      
      setUploadedData(uploadedDataObj);
      
      // Propagate to parent component if callback exists
      if (onDatasetChange) {
        onDatasetChange(value, uploadedDataObj);
      }
      
      // Always create an initial result with the dataset info
      setResult({
        code: `# Dataset: ${value}`,
        output: `Dataset ${value} loaded with ${result.rows.length} rows and ${
          result.rows.length > 0 ? Object.keys(result.rows[0] || {}).length : 0
        } columns.`,
        datasetSummary: result.summary,
        datasetRows: result.rows.slice(0, 20) // Show first 20 rows
      });
      
      toast({
        title: "Dataset Selected",
        description: `Loaded ${value} (${result.rows.length} rows)`
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
    // Update local state
    setUploadedData(data);
    setSelectedDataset(null);
    
    // Propagate to parent component if callback exists
    if (onDatasetChange) {
      onDatasetChange(null, data);
    }
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
            datasetOptions={datasetOptions}
            onNavigateToDataTab={onNavigateToDataTab}
          />
          
          <FeedbackForm />
        </div>
        
        {/* Main content area */}
        <div className="md:col-span-2 space-y-4">
          {!result ? (
            <BasicTabHeader />
          ) : (
            <CodeResultDisplay 
              result={result} 
              onNavigateToDataTab={onNavigateToDataTab}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicTab;
