import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatMessage } from './types';
import { apiKeyStorage } from '@/lib/utils';

// Create a function to get a fresh instance of the Gemini client with the current API key
const createGeminiClient = () => {
  const apiKey = apiKeyStorage.getGeminiApiKey();
  return new GoogleGenerativeAI(apiKey || 'dummy-key'); // Will fail if user hasn't set a key
};

const geminiApiClient = {
  sendMessage: async (messages: ChatMessage[], modelName: string = 'gemini-1.5-pro', temperature: number = 0.7): Promise<string> => {
    try {
      const apiKey = apiKeyStorage.getGeminiApiKey();
      
      if (!apiKey) {
        throw new Error('Gemini API key not provided. Please add your API key in Settings.');
      }
      
      const genAI = createGeminiClient();
      const model = genAI.getGenerativeModel({ model: modelName });

      // Extract system instruction if present
      const systemMessage = messages.find(msg => msg.role === 'system');
      const chatMessages = messages.filter(msg => msg.role !== 'system');

      // Convert ChatMessage[] to the format expected by Gemini
      const formattedMessages = chatMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : msg.role,
        parts: [{ text: msg.content }],
      }));

      // Build the request payload
      const requestPayload: any = {
        contents: formattedMessages,
        generationConfig: {
          temperature: temperature
        }
      };

      // Include system instruction if available
      if (systemMessage) {
        requestPayload.systemInstruction = {
          parts: [{ text: systemMessage.content }],
        };
      }

      const result = await model.generateContent(requestPayload);

      return result.response.text();
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Failed to get response from Gemini service: ' + 
        (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
};

export default geminiApiClient;
