import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import PromptInput from '../PromptInput';
import { demoImagePrompts } from '@/lib/demoData';
import { Loader2 } from 'lucide-react';
import openaiApiClient from '../../services/openaiApiClient';

const SynthImagesTab: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('dall-e-3');
  const [selectedSize, setSelectedSize] = useState('1024x1024');
  const [availableSizes, setAvailableSizes] = useState<Array<{value: string, label: string}>>([]);

  const modelOptions = [
    { value: 'dall-e-3', label: 'DALL-E 3 (Default)' },
    { value: 'dall-e-2', label: 'DALL-E 2' },
  ];

  // Define size options based on model
  const allSizeOptions = {
    'dall-e-3': [
      { value: '1024x1024', label: '1024x1024 (Default)' },
    ],
    'dall-e-2': [
      { value: '1024x1024', label: '1024x1024 (Large)' },
      { value: '512x512', label: '512x512 (Medium)' },
      { value: '256x256', label: '256x256 (Small)' },
    ]
  };

  // Update available sizes when model changes
  useEffect(() => {
    const newSizes = allSizeOptions[selectedModel as keyof typeof allSizeOptions] || allSizeOptions['dall-e-3'];
    setAvailableSizes(newSizes);
    
    // If current size is not available in the new model, reset to default for that model
    if (!newSizes.some(size => size.value === selectedSize)) {
      setSelectedSize(selectedModel === 'dall-e-3' ? '1024x1024' : '512x512');
    }
  }, [selectedModel, selectedSize]);

  const handleSubmit = async (prompt: string) => {
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      toast({
        title: "API Key Required",
        description: "Please set your OpenAI API key in the environment variables to use this feature.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Prepare the prompt - similar to the R code's preprocessing
      let preparedPrompt = prompt;
      const maxCharLimit = 1000;
      
      // Trim if the prompt is too long
      if (preparedPrompt.length > maxCharLimit) {
        preparedPrompt = preparedPrompt.substring(0, maxCharLimit);
        toast({
          title: "Prompt Truncated",
          description: `Only the first ${maxCharLimit} characters will be used.`,
          duration: 5000
        });
      }
      
      // Add a period at the end if it doesn't have one
      if (!preparedPrompt.endsWith('.')) {
        preparedPrompt += '.';
      }
      
      // Quality parameter only for DALL-E 3
      const quality = selectedModel === 'dall-e-3' ? 'standard' : undefined;
      
      // Generate the image using the OpenAI API
      const generatedImageUrl = await openaiApiClient.generateImage(
        preparedPrompt,
        selectedModel,
        selectedSize,
        quality as any,
        1
      );
      
      if (generatedImageUrl) {
        setImageUrl(generatedImageUrl);
      } else {
        toast({
          title: "Error",
          description: "Failed to generate image. No URL returned.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
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
          <h2 className="text-2xl font-bold">Synthetic Image Generation</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Generate synthetic images with AI models for visualization, examples, or educational purposes
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
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
              
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Select Image Size</label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full dark:bg-gray-700">
                    <SelectValue placeholder="Select Image Size" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSizes.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <PromptInput
              placeholder="Enter a prompt for synthetic image generation..."
              demoPrompts={demoImagePrompts}
              onSubmit={handleSubmit}
              buttonText="Generate Synth Image"
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
        ) : imageUrl ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generated Image</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <img 
                src={imageUrl} 
                alt="Generated synthetic image"
                className="max-w-full h-auto rounded-md shadow-md" 
              />
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default SynthImagesTab;
