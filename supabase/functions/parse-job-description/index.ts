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
    const { jobDescription } = await req.json();
    
    if (!jobDescription) {
      return new Response(
        JSON.stringify({ error: 'Job description is required' }),
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

    console.log('Parsing job description with AI...');

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
            content: 'You are an expert at parsing job descriptions and extracting structured information. Extract all relevant details accurately.'
          },
          {
            role: 'user',
            content: `Parse this job description and extract structured information:\n\n${jobDescription}`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'parse_job_description',
              description: 'Extract structured information from a job description',
              parameters: {
                type: 'object',
                properties: {
                  title: { 
                    type: 'string',
                    description: 'Job title' 
                  },
                  department: { 
                    type: 'string',
                    description: 'Department or team' 
                  },
                  location: { 
                    type: 'string',
                    description: 'Location (can be city, remote, hybrid)' 
                  },
                  employment_type: { 
                    type: 'string',
                    description: 'Employment type (Full-time, Part-time, Contract, etc.)' 
                  },
                  description: { 
                    type: 'string',
                    description: 'Full job description and responsibilities' 
                  },
                  requirements: { 
                    type: 'string',
                    description: 'Required skills, qualifications, and experience' 
                  },
                  salary_range: { 
                    type: 'string',
                    description: 'Salary range if mentioned' 
                  },
                  benefits: { 
                    type: 'string',
                    description: 'Benefits and perks if mentioned' 
                  }
                },
                required: ['title', 'description'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { 
          type: 'function', 
          function: { name: 'parse_job_description' } 
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
        JSON.stringify({ error: 'Failed to process job description' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract the parsed job data from tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || !toolCall.function?.arguments) {
      console.error('Invalid AI response structure');
      return new Response(
        JSON.stringify({ error: 'Failed to parse job description' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const parsedJob = JSON.parse(toolCall.function.arguments);
    console.log('Job parsed successfully:', parsedJob.title);

    return new Response(
      JSON.stringify({ success: true, job: parsedJob }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in parse-job-description:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
