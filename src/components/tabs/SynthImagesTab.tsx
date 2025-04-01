
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import PromptInput from '../PromptInput';
import { demoImagePrompts } from '@/lib/demoData';
import apiService from '@/lib/apiService';
import { Loader2 } from 'lucide-react';

const SynthImagesTab: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleSubmit = async (prompt: string) => {
    if (!apiService.getApiKey()) {
      toast({
        title: "API Key Required",
        description: "Please set your OpenAI API key in the Settings to use this feature.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.generateSyntheticImage(prompt);
      
      if (response.success && response.data) {
        // In real implementation, this would be a URL to the generated image
        setImageUrl('https://mdn.github.io/dom-examples/canvas/pixel-manipulation/bicycle.png');
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to generate image",
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
            src="https://wiki.socr.umich.edu/images/thumb/5/5e/SOCR_UMich_2020a.png/1025px-SOCR_UMich_2020a.png" 
            alt="SOCR Logo"
            className="h-24 w-auto mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold">Synthetic Image Generation</h2>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <PromptInput
              placeholder="Enter a prompt for synthetic image generation..."
              demoPrompts={demoImagePrompts}
              onSubmit={handleSubmit}
              buttonText="Generate Synth Image"
              selectLabel="Choose an example prompt"
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
