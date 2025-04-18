import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import PromptInput from '../PromptInput';
import { Loader2 } from 'lucide-react';
import openaiApiClient from '../../services/openaiApiClient';
import googleApiClient from '../../services/googleApiClient';
import { ChatMessage } from '../../services/types'; 


const AskTab: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [history, setHistory] = useState<ChatMessage[]>([]);
      
  const modelOptions = [
    { value: 'gpt-4o-mini', label: 'Choose Model: (Default GPT-4o-mini)' },
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
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
      const userMessage: ChatMessage = {
        role: 'user',
        content: prompt,
      };
  
      const systemMessage: ChatMessage = {
        role: 'system',
        content:
          "You are an AI Bot developed by the SOCR (Statistical Online Computational Resource) Team that is specialized in the medical and statistics field. When faced with complex questions, think through the problem step by step before arriving at a conclusion.",
      };
  
      const messagesForApi = [systemMessage, userMessage];
      let response: string;
  
      if (selectedModel.startsWith("gpt")) {
        response = await openaiApiClient.sendMessage(messagesForApi, selectedModel);
      } else if (selectedModel.startsWith("gemini")) {
        response = await googleApiClient.sendMessage(messagesForApi, selectedModel);
      } else {
        throw new Error("Unsupported model selected.");
      }
  
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
      };
  
      setHistory((prev) => [...prev, userMessage, assistantMessage]);
      setResult(`SOCR AI-Bot: "${assistantMessage.content}"`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
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

            {/* Fixed loading to isLoading to match the PromptInput component's props */}
            <PromptInput
              placeholder="Ask a question about statistics, data science, or your analysis..."
              demoPrompts={demoPrompts}
              onSubmit={handleSubmit}
              buttonText="Ask Question"
              isLoading={loading}
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
        )
        /*
        : result ? (
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
          ) 
        */
         : null}

        {/* Display chat history below the current answer */}
        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(() => {
                  const conversationPairs: ChatMessage[][] = [];
                  // Group every two messages into a pair
                  for (let i = 0; i < history.length; i += 2) {
                    conversationPairs.push(history.slice(i, i + 2));
                  }
                  // Reverse the conversation pairs so the latest turn appears on top
                  return conversationPairs.reverse().map((pair, i) => (
                    <div key={i}>
                      {pair.map((message, j) => (
                        <div
                          key={j}
                          className={`p-2 rounded ${
                            message.role === 'user'
                              ? 'bg-blue-50'
                              : message.role === 'assistant'
                              ? 'bg-green-50'
                              : 'bg-gray-50'
                          }`}
                        >
                          <strong>
                            {message.role === 'user'
                              ? 'You'
                              : message.role === 'assistant'
                              ? 'SOCR AI-Bot'
                              : 'System'}
                            :
                          </strong>{' '}
                          {message.content}
                        </div>
                      ))}
                    </div>
                  ));
                })()}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AskTab;
