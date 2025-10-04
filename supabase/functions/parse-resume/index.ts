import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileData, mimeType } = await req.json();
    
    if (!fileData) {
      throw new Error("No file data provided");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Parsing resume with AI...");

    // Call Lovable AI to parse the resume
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract candidate information from this resume. Parse all available details including name, email, phone, LinkedIn URL, current company, current position, years of experience, and skills."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${fileData}`
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_candidate_info",
              description: "Extract candidate information from a resume",
              parameters: {
                type: "object",
                properties: {
                  full_name: { 
                    type: "string",
                    description: "The candidate's full name"
                  },
                  email: { 
                    type: "string",
                    description: "The candidate's email address"
                  },
                  phone: { 
                    type: "string",
                    description: "The candidate's phone number"
                  },
                  linkedin_url: { 
                    type: "string",
                    description: "The candidate's LinkedIn profile URL"
                  },
                  current_company: { 
                    type: "string",
                    description: "The candidate's current company"
                  },
                  current_position: { 
                    type: "string",
                    description: "The candidate's current job title/position"
                  },
                  experience_years: { 
                    type: "integer",
                    description: "Total years of professional experience"
                  },
                  skills: { 
                    type: "array",
                    items: { type: "string" },
                    description: "List of technical skills, technologies, and competencies"
                  }
                },
                required: ["full_name"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { 
          type: "function", 
          function: { name: "extract_candidate_info" } 
        }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error("Failed to parse resume with AI");
    }

    const aiResponse = await response.json();
    console.log("AI response received");

    // Extract the function call result
    const toolCall = aiResponse.choices[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No structured data returned from AI");
    }

    const candidateData = JSON.parse(toolCall.function.arguments);
    console.log("Parsed candidate data:", candidateData);

    return new Response(
      JSON.stringify({ success: true, data: candidateData }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error parsing resume:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to parse resume" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
