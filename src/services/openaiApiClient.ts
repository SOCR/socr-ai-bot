import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, // Get API key from environment variables
  dangerouslyAllowBrowser: true // Only for demo purposes
});

// Define message interface based on OpenAI's format
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// OpenAI API client
const openaiApiClient = {
  // Send messages to OpenAI and get a response
  sendMessage: async (messages: ChatMessage[], model_name: string = 'gpt-3.5-turbo'): Promise<string> => {
    try {
      const response = await openai.chat.completions.create({
        model: model_name, // You can change this to a different model
        messages: messages,
        temperature: 0.7,
      });

      // Return the content from the first response choice
      return response.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw new Error('Failed to get response from AI service');
    }
  }
};

export default openaiApiClient; 