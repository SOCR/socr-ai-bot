import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatMessage } from './types';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const geminiApiClient = {
  sendMessage: async (messages: ChatMessage[], modelName: string = 'gemini-1.5-pro', temperature: number = 0.7): Promise<string> => {
    try {
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
      throw new Error('Failed to get response from Gemini service');
    }
  }
};

export default geminiApiClient;
