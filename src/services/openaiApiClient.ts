import OpenAI from 'openai';
import { ChatMessage } from './types'; // ✅ Use shared interface

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, // Get API key from environment variables
  dangerouslyAllowBrowser: true // Only for demo purposes
});

// OpenAI API client
const openaiApiClient = {
  // Send messages to OpenAI and get a response
  sendMessage: async (messages: ChatMessage[], model_name: string = 'gpt-3.5-turbo'): Promise<string> => {
    try {
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
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw new Error('Failed to get response from AI service');
    }
  }
};

export default openaiApiClient;
