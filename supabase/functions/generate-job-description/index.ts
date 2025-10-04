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
    const { title, department, location, employmentType, keyRequirements, companyInfo } = await req.json();
    
    if (!title) {
      return new Response(
        JSON.stringify({ error: 'Job title is required' }),
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

    console.log('Generating job description with AI for:', title);

    // Build the prompt with provided information
    const prompt = `Create a professional and compelling job description for the following position:

Job Title: ${title}
${department ? `Department: ${department}` : ''}
${location ? `Location: ${location}` : ''}
${employmentType ? `Employment Type: ${employmentType}` : ''}
${keyRequirements ? `Key Requirements: ${keyRequirements}` : ''}
${companyInfo ? `Company Information: ${companyInfo}` : ''}

Generate a complete job description that includes:
1. An engaging overview of the role
2. Key responsibilities (5-7 bullet points)
3. Required qualifications and skills
4. Nice-to-have qualifications
5. What we offer (benefits, growth opportunities)

Make it professional, clear, and attractive to candidates. Format it in a well-structured way with clear sections.`;

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
            content: 'You are an expert HR professional and technical recruiter who writes compelling job descriptions that attract top talent. Write clear, professional, and engaging job descriptions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
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
        JSON.stringify({ error: 'Failed to generate job description' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const generatedDescription = data.choices?.[0]?.message?.content;

    if (!generatedDescription) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'Failed to generate job description' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Job description generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        description: generatedDescription 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-job-description:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
