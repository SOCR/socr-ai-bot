import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import PromptInput from '../PromptInput';
import { demoSynthPrompts } from '@/lib/demoData';
import { Loader2 } from 'lucide-react';
import openaiApiClient from '../../services/openaiApiClient';
import geminiApiClient from '../../services/googleApiClient';
import { ChatMessage } from '../../services/types';

const SynthTextTab: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');

  const modelOptions = [
    { value: 'gpt-4o-mini', label: 'Choose Model: (Default GPT-4o-mini)', provider: 'openai' },
    { value: 'gpt-4o', label: 'GPT-4o', provider: 'openai' },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', provider: 'google' },
    { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite', provider: 'google' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', provider: 'google' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', provider: 'google' },
  ];

  const getModelProvider = (modelName: string) => {
    const model = modelOptions.find(m => m.value === modelName);
    return model?.provider || 'openai';
  };

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
          "You are an AI Bot developed by the SOCR (Statistical Online Computational Resource) Team that specializes in synthetic text generation. Generate creative and detailed content based on the user's prompt.",
      };
  
      const messagesForApi = [systemMessage, userMessage];
      const provider = getModelProvider(selectedModel);

      let response;
      if (provider === 'openai') {
        response = await openaiApiClient.sendMessage(messagesForApi, selectedModel);
      } else {
        response = await geminiApiClient.sendMessage(messagesForApi, selectedModel);
      }
      
      setText(response);
    } catch (error) {
      console.error("Error generating text:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate text. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <img 
            src="/lovable-uploads/2ee5da75-de6a-4182-be30-93984b17ea5d.png" 
            alt="SOCR Logo"
            className="h-24 w-auto mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold">Synthetic Text Generation</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Generate synthetic text with AI models for creative content, examples, or educational purposes
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

            <PromptInput
              placeholder="Enter a prompt for synthetic text generation..."
              demoPrompts={demoSynthPrompts}
              onSubmit={handleSubmit}
              buttonText="Generate Synth Text"
              selectLabel="Choose an example prompt"
              isLoading={loading}
            />
          </CardContent>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="p-6 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-socr-blue" />
            </CardContent>
          </Card>
        ) : text ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generated Text</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none dark:prose-invert">
                <p className="whitespace-pre-wrap">{text}</p>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default SynthTextTab;
