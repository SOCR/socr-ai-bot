
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import PromptInput from '../PromptInput';
import DataUpload from '../DataUpload';
import CodeBlock from '../CodeBlock';
import FeedbackForm from '../FeedbackForm';
import Accordion from '../Accordion';
import AccordionItem from '../AccordionItem';
import apiService from '@/lib/apiService';
import { demoQuestions } from '@/lib/demoData';
import DatasetSelector from '../DatasetSelector';

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
  
  const handleDatasetSelect = (value: string) => {
    setSelectedDataset(value);
    setUploadedData(null);
    toast({
      title: "Dataset Selected",
      description: `Using the ${value} dataset`
    });
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
                  <DatasetSelector onSelect={handleDatasetSelect} />
                  
                  <p className="text-sm text-center dark:text-gray-400">or</p>
                  
                  <DataUpload onDataUploaded={handleDataUpload} />
                </div>
                
                <PromptInput
                  placeholder="Ask a question about your data or request a specific analysis..."
                  demoPrompts={demoQuestions}
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
          
          <FeedbackForm />
        </div>
        
        {/* Main content area */}
        <div className="md:col-span-2 space-y-4">
          {!result ? (
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4 py-6">
                  <img 
                    src="/lovable-uploads/2ee5da75-de6a-4182-be30-93984b17ea5d.png" 
                    alt="SOCR Logo" 
                    className="h-24 w-auto"
                  />
                  <div className="text-center space-y-2 max-w-2xl">
                    <h3 className="text-xl font-semibold dark:text-white">Welcome to SOCR AI Bot</h3>
                    <p className="dark:text-gray-300">
                      SOCR AI Bot provides a helpful human-machine interface. It utilizes SOCR and various 
                      generative-AI models trained on billions of pieces of information, thousands of books, 
                      millions of code repositories, and innumerable web pages, written in dozens of languages. 
                      English is the default language, but other languages may also work.
                    </p>
                  </div>
                  
                  <Accordion id="Instructions">
                    <AccordionItem title="Instructions" status="danger">
                      <ul className="list-disc pl-5 space-y-2 dark:text-gray-300">
                        <li>Try simple experiments first before gradually adding complexity, specifying alternative plots, or choosing different models.</li>
                        <li>AI Bot is a prototype release expanding OpenAI API, RTutor, SOCRAT, and other resources. It's intended for simple and quick demonstrations, not heavy research, complicated studies, or high-throughput analytics.</li>
                        <li>When using generative-AI functionality (e.g., to synthetically generate text, images or software code), you have to use your own personal OpenAI unique key.</li>
                        <li>Experiment with parameter settings, e.g., increasing the "Temperature" setting may drive more aggressive AI predictions.</li>
                        <li>Preprocess and prep the test data prior to loading it in the AI Bot. You can use <a href="https://socr.umich.edu/HTML5/SOCRAT/" className="text-socr-blue hover:underline dark:text-socr-lightblue">SOCRAT's data wrangling functionality</a> for preprocessing.</li>
                        <li>An example dataset for testing data uploading is available <a href="https://socr.umich.edu/docs/uploads/2023/SOCR_Dataset_Gapminder.csv" className="text-socr-blue hover:underline dark:text-socr-lightblue">here</a>.</li>
                        <li>Confirm proper data type specifications: numeric columns and categories (factors or characters).</li>
                        <li>Each chunk of code is run independently using the selected/uploaded data. If you want to build upon the current code, select the "Continue from this chunk" checkbox.</li>
                      </ul>
                    </AccordionItem>
                  </Accordion>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg dark:text-white">AI Generated Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <CodeBlock code={result.code} language="r" />
                </CardContent>
              </Card>
              
              {result.error ? (
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800/40">
                  <CardContent className="p-4">
                    <p className="text-red-600 font-medium dark:text-red-300">Error:</p>
                    <p className="font-mono text-sm dark:text-red-300">{result.error}</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg dark:text-white">Results</CardTitle>
                    </CardHeader>
                    <CardContent className="dark:text-gray-300">
                      <p className="mb-4">{result.output}</p>
                      {result.plot && (
                        <div className="border rounded-md p-2 bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
                          <img 
                            src={result.plot} 
                            alt="Plot visualization" 
                            className="max-w-full h-auto mx-auto"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicTab;
