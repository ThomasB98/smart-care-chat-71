import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    const systemPrompt = `You are an expert at predicting what a user would say next in a conversation with a healthcare assistant.
Based on the assistant's last message, generate a short, natural-sounding, and relevant question or reply that a human user would likely type.
- Keep the reply concise (usually one sentence).
- Do not act as an assistant. You are generating a reply *for* the user.
- Do not wrap the reply in quotes.
- Examples:
  - Assistant: "Would you like to schedule an appointment?" -> User reply: "Yes, please."
  - Assistant: "I can help you check your symptoms. What symptoms are you experiencing?" -> User reply: "I have a headache and a fever."
  - Assistant: "Here's a health tip for you: Stay hydrated..." -> User reply: "Thanks for the tip!"
`;

    const response = await fetch('https://api.aimlapi.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `The assistant said: "${message}"` }
        ],
        max_tokens: 50,
        temperature: 0.5,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('AI/ML API error:', data);
      throw new Error(data.error?.message || 'Failed to get AI response');
    }

    const aiReply = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      reply: aiReply,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-generate-reply function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}); 