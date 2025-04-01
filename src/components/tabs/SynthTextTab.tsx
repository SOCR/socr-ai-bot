
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import PromptInput from '../PromptInput';
import { demoSynthPrompts } from '@/lib/demoData';
import apiService from '@/lib/apiService';
import { Loader2 } from 'lucide-react';

const SynthTextTab: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<string | null>(null);

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
      const response = await apiService.generateSyntheticText(prompt);
      
      if (response.success && response.data) {
        setText(response.data);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to generate text",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error generating text:", error);
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
          <h2 className="text-2xl font-bold">Synthetic Text Generation</h2>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
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
              <div className="prose max-w-none">
                <p className="text-socr-blue">{text}</p>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default SynthTextTab;
