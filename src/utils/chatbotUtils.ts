import { symptoms, symptomAnalysis, healthTips, healthFAQs } from "../data/healthData";
import { supabase } from "@/integrations/supabase/client";

export interface MessageType {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type: 'text' | 'options' | 'symptom-checker' | 'appointment' | 'reminder' | 'health-tip' | 'nearby-doctors';
  options?: string[];
  messages?: MessageType[]; // For storing message history
}

// Generate a unique ID for messages
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Mapbox token for maps functionality
export const MAPBOX_TOKEN = "pk.eyJ1IjoidGhvbWFzYjk4IiwiYSI6ImNtYTc3Z2N4dDB2ZzAybHNkdGxwYWV5YmYifQ.Cjl9InQhsLNvGhxJJs3ymg";

// Call AI chat function for intelligent responses
export const getAIResponse = async (message: string, context?: string): Promise<string> => {
  try {
    console.log('Calling AI function with message:', message);
    
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: {
        message,
        context: context || 'healthcare chatbot conversation'
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }

    if (!data.success) {
      console.error('AI function returned error:', data.error);
      throw new Error(data.error || 'Failed to get AI response');
    }

    return data.response;
  } catch (error) {
    console.error('Error calling AI function:', error);
    // Fallback to basic responses if AI fails
    return "I apologize, but I'm having trouble processing your request right now. Please try asking about specific symptoms, scheduling an appointment, or getting health tips.";
  }
};

// Enhanced process user input with AI integration
export const processUserInput = async (userInput: string): Promise<MessageType> => {
  const userInputLower = userInput.toLowerCase();
  
  console.log("Processing user input:", userInput);
  
  // Check for specific functionality keywords first
  if (userInputLower.includes('symptom') || userInputLower.includes('not feeling well') || userInputLower.includes('sick')) {
    return {
      id: generateId(),
      content: "I can help you check your symptoms. What symptoms are you experiencing?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'symptom-checker',
      options: symptoms.map(s => s.label)
    };
  } 
  else if (userInputLower.includes('appointment') || userInputLower.includes('schedule') || userInputLower.includes('booking') || userInputLower.includes('doctor')) {
    return {
      id: generateId(),
      content: "Would you like to schedule an appointment with a healthcare provider?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'appointment'
    };
  } 
  else if (userInputLower.includes('medicine') || userInputLower.includes('medication') || userInputLower.includes('reminder')) {
    return {
      id: generateId(),
      content: "I can help you set up medication reminders. Would you like to add one?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'reminder'
    };
  }
  else if (userInputLower.includes('hospital') || userInputLower.includes('nearby') || userInputLower.includes('find') || userInputLower.includes('location') || userInputLower.includes('doctors near me')) {
    return {
      id: generateId(),
      content: "I can help you find nearby hospitals and doctors. Would you like me to show you healthcare facilities in your area?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'nearby-doctors'
    };
  }
  else {
    // Use AI for general healthcare questions and conversations
    try {
      const aiResponse = await getAIResponse(userInput);
      return {
        id: generateId(),
        content: aiResponse,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
    } catch (error) {
      console.error('AI response failed, using fallback:', error);
      // Fallback response
      return {
        id: generateId(),
        content: "I understand you'd like to chat! I'm here to help with your health concerns. You can ask me about symptoms, schedule an appointment, set medication reminders, get health tips and information, or find nearby healthcare facilities. What would you like to know?",
        sender: 'bot',
        timestamp: new Date(),
        type: 'options',
        options: ["Check symptoms", "Schedule appointment", "Set medication reminder", "Get health tips", "Ask health questions", "Find nearby doctors"]
      };
    }
  }
};

export const generateSuggestedReply = async (botMessage: string): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('ai-generate-reply', {
      body: { message: botMessage }
    });

    if (error) {
      console.error('Supabase function error (generate reply):', error);
      throw error;
    }

    if (!data.success || !data.reply) {
      console.error('AI function returned error (generate reply):', data.error);
      throw new Error(data.error || 'Failed to get suggested reply');
    }

    return data.reply;
  } catch (error) {
    console.error('Error calling generate reply function:', error);
    return "Sorry, I can't suggest a reply right now.";
  }
};
