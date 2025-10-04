import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobRequirements, candidates } = await req.json();
    
    if (!jobRequirements || !candidates || !Array.isArray(candidates)) {
      return new Response(
        JSON.stringify({ error: 'Job requirements and candidates array are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Matching candidates with AI for job requirements');

    const candidateSummaries = candidates.map(c => ({
      id: c.id,
      name: c.full_name,
      experience: c.experience_years,
      skills: c.skills || [],
      position: c.current_position,
      company: c.current_company
    }));

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert technical recruiter and talent matcher. Analyze candidates and match them to job requirements based on skills, experience, and fit. Provide match scores and detailed reasoning.'
          },
          {
            role: 'user',
            content: `Job Requirements:\n${jobRequirements}\n\nCandidates:\n${JSON.stringify(candidateSummaries, null, 2)}\n\nAnalyze each candidate and provide a match score (0-100) with reasoning.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "score_candidates",
              description: "Score and rank candidates based on job requirements",
              parameters: {
                type: "object",
                properties: {
                  matches: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        candidate_id: { type: "string" },
                        score: { type: "integer", minimum: 0, maximum: 100 },
                        strengths: { type: "array", items: { type: "string" } },
                        weaknesses: { type: "array", items: { type: "string" } },
                        recommendation: { type: "string" }
                      },
                      required: ["candidate_id", "score", "strengths", "recommendation"]
                    }
                  }
                },
                required: ["matches"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { 
          type: "function", 
          function: { name: "score_candidates" } 
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to match candidates' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No structured data returned from AI');
    }

    const matchResults = JSON.parse(toolCall.function.arguments);
    console.log('Candidate matching completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        matches: matchResults.matches 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in match-candidates:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
