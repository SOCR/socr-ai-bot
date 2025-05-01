import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { listDatasets, fetchDataset } from '@/lib/webr';
import FeedbackForm from '../FeedbackForm';
import apiService from '@/lib/apiService';
import { demoQuestions } from '@/lib/demoData';
import BasicTabHeader from '../basic/BasicTabHeader';
import CodeResultDisplay from '../basic/CodeResultDisplay';
import ControlPanel from '../basic/ControlPanel';
import openaiApiClient from '../../services/openaiApiClient';
import googleApiClient from '../../services/googleApiClient';
import { ChatMessage } from '../../services/types';

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
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  
  // Add model options similar to AskTab
  const modelOptions = [
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Default)' },
    { value: 'gpt-4o', label: 'GPT-4o (More powerful)' },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  ];

  // Handle model selection change
  const handleModelChange = (value: string) => {
    setSelectedModel(value);
  };

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
    
    // Get dataset summary and preview rows from uploadedData if available
    const datasetSummary = uploadedData?.summary || null;
    const datasetRows = uploadedData?.data ? uploadedData.data.slice(0, 20) : null;
    const datasetName = selectedDataset || (uploadedData?.name || "unknown");

    try {
      // Create detailed system prompt with dataset information
      let systemPrompt = `You are an expert R programmer for the SOCR (Statistical Online Computational Resource) AI Bot. 
Generate clean, well-commented R code to analyze the dataset according to the user's request.
${datasetSummary ? `\nHere's information about the dataset structure:\n${datasetSummary}` : ""}
${datasetRows && datasetRows.length > 0 ? `\nHere's a preview of the first few rows of data (up to 5 shown here):
${JSON.stringify(datasetRows.slice(0, 5), null, 2)}` : ""}

Important guidelines:
1. Always include library imports at the top of your code
2. Assume the data is already loaded into a variable called 'df'
3. Include appropriate data cleaning and validation steps
4. Generate well-commented, concise, readable R code
5. For visualizations, use ggplot2 with appropriate styling and labels
6. Output ONLY the R code, without explanations before or after

DO NOT include any markdown formatting or backticks. Output pure R code only.`;

      // Prepare messages for the LLM API
      const userMessage: ChatMessage = {
        role: 'user',
        content: `Generate R code for this request: ${inputPrompt}`,
      };
      
      const systemMessage: ChatMessage = {
        role: 'system',
        content: systemPrompt,
      };
      
      const messagesForApi = [systemMessage, userMessage];
      let generatedCode: string;
      
      // Call the appropriate API based on the model name
      if (selectedModel.startsWith("gpt") || !selectedModel.startsWith("gemini")) {
        // Default to OpenAI if not specified or starts with "gpt"
        generatedCode = await openaiApiClient.sendMessage(messagesForApi, selectedModel || "gpt-4o-mini");
      } else {
        // Use Google's Gemini API
        generatedCode = await googleApiClient.sendMessage(messagesForApi, selectedModel);
      }

      // Show a notification that we're executing the code (and possibly installing packages)
      toast({
        title: "Executing R Code",
        description: "Running your analysis... any required packages will be automatically installed.",
        duration: 5000
      });

      // Execute the LLM-generated code on the backend
      const response = await apiService.executeRCode(
        generatedCode,
        selectedDataset || uploadedData
      );
      
      if (response.success) {
        setResult({
          code: generatedCode,
          output: response.data?.output || "Code executed successfully. Results shown below.",
          plot: response.data?.plot || undefined, // Use actual plot from WebR if available
          datasetSummary,
          datasetRows
        });
      } else {
        // Code execution failed, but we'll still show the generated code
        setResult({
          code: generatedCode,
          output: "",
          error: response.error || 'An error occurred when executing the code',
          datasetSummary,
          datasetRows
        });
        toast({
          title: "Execution Error",
          description: response.error || 'An error occurred when executing the generated code',
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error generating or executing code:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive"
      });
      setResult({
        code: `# An error occurred while generating R code for: "${inputPrompt}"`,
        output: "",
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        datasetSummary,
        datasetRows
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
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
            modelOptions={modelOptions}
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
