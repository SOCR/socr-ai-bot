
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import PromptInput from '../PromptInput';
import { Loader2 } from 'lucide-react';

const AskTab: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');

  const modelOptions = [
    { value: 'gpt-4o', label: 'GPT-4o (Recommended)' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Faster)' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  ];

  const demoPrompts = [
    { value: 'explain-regression', label: 'Explain linear regression in simple terms' },
    { value: 'compare-ml-algorithms', label: 'Compare decision trees and neural networks' },
    { value: 'stats-question', label: 'What is the difference between Type I and Type II errors?' },
    { value: 'data-viz-tips', label: 'Best practices for effective data visualization' },
    { value: 'ml-workflow', label: 'Describe a typical machine learning workflow' }
  ];

  const handleSubmit = async (prompt: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResult(`Here's an answer for your question: "${prompt}"\n\nThis would be a detailed response from the AI model, explaining concepts, providing examples, and offering insights based on your query.`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <img 
            src="/lovable-uploads/2ee5da75-de6a-4182-be30-93984b17ea5d.png" 
            alt="SOCR Logo"
            className="h-24 w-auto mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold mb-2">Ask AI</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Ask questions about statistics, data science, or get help interpreting your results
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Select AI Model</label>
              <Select defaultValue={selectedModel} onValueChange={setSelectedModel}>
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

            {/* Fixed the isLoading prop issue by using loading instead */}
            <PromptInput
              placeholder="Ask a question about statistics, data science, or your analysis..."
              demoPrompts={demoPrompts}
              onSubmit={handleSubmit}
              buttonText="Ask Question"
              loading={loading}
              rows={5}
              selectLabel="Choose an example question"
            />
          </CardContent>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="p-6 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-socr-blue" />
            </CardContent>
          </Card>
        ) : result ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none dark:prose-invert">
                <p className="whitespace-pre-wrap">{result}</p>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default AskTab;
