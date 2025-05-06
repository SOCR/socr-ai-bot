import OpenAI from 'openai';
import { ChatMessage } from './types';
import { apiKeyStorage } from '@/lib/utils';

// Initialize OpenAI client with dynamic API key
const createOpenAIClient = () => {
  const apiKey = apiKeyStorage.getOpenAIApiKey();
  return new OpenAI({
    apiKey: apiKey || 'dummy-key', // Will fail if user hasn't set a key
    dangerouslyAllowBrowser: true // Only for demo purposes
  });
};

// OpenAI API client
const openaiApiClient = {
  // Send messages to OpenAI and get a response
  sendMessage: async (messages: ChatMessage[], model_name: string = 'gpt-3.5-turbo', temperature: number = 0.7): Promise<string> => {
    try {
      const apiKey = apiKeyStorage.getOpenAIApiKey();
      
      if (!apiKey) {
        throw new Error('OpenAI API key not provided. Please add your API key in Settings.');
      }
      
      const openai = createOpenAIClient();
      
      // Filter out 'model' role since OpenAI does not support it
      const filteredMessages = messages
        .filter((msg) => msg.role !== 'model') // 🧠 strip Gemini-specific roles
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant' | 'system', // ✅ safe cast
          content: msg.content
        }));

      const response = await openai.chat.completions.create({
        model: model_name,
        messages: filteredMessages,
        temperature: temperature, // Use the provided temperature value
      });

      return response.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw new Error('Failed to get response from AI service: ' + 
        (error instanceof Error ? error.message : 'Unknown error'));
    }
  },

  // Generate images using DALL-E
  generateImage: async (
    prompt: string, 
    model: string = 'dall-e-3', 
    size: string = '1024x1024',
    quality: string = 'standard',
    n: number = 1
  ): Promise<string> => {
    try {
      const apiKey = apiKeyStorage.getOpenAIApiKey();
      
      if (!apiKey) {
        throw new Error('OpenAI API key not provided. Please add your API key in Settings.');
      }
      
      const openai = createOpenAIClient();
      
      // DALL-E 2 only supports 256x256, 512x512, or 1024x1024
      let adjustedSize = size;
      let adjustedQuality = quality;
      
      if (model === 'dall-e-2') {
        // Ensure size is compatible with DALL-E 2
        if (!['256x256', '512x512', '1024x1024'].includes(size)) {
          adjustedSize = '1024x1024'; // Default to 1024x1024 if incompatible size
          console.log(`Size ${size} not supported by DALL-E 2, using 1024x1024 instead`);
        }
        
        // DALL-E 2 doesn't support quality parameter
        adjustedQuality = undefined as any;
      }

      const requestParams: any = {
        model: model,
        prompt: prompt,
        n: n,
        size: adjustedSize,
        response_format: 'url',
      };
      
      // Only add quality for DALL-E 3
      if (model === 'dall-e-3' && adjustedQuality) {
        requestParams.quality = adjustedQuality;
      }

      const response = await openai.images.generate(requestParams);

      // Return the URL of the generated image
      return response.data[0]?.url || '';
    } catch (error) {
      console.error('Error generating image:', error);
      throw new Error('Failed to generate image: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
};

export default openaiApiClient;
