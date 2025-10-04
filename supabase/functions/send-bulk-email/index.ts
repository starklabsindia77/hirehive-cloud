import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BulkEmailRequest {
  candidateIds: string[];
  subject: string;
  content: string;
  fromName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { candidateIds, subject, content, fromName }: BulkEmailRequest =
      await req.json();

    if (!candidateIds || candidateIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "No candidate IDs provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get org schema for user
    const { data: orgSchema } = await supabaseClient.rpc(
      "get_user_org_schema",
      { _user_id: user.id }
    );

    if (!orgSchema) {
      return new Response(
        JSON.stringify({ error: "No organization found" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch candidates
    const { data: candidates, error: candidatesError } =
      await supabaseClient.rpc("get_org_candidates", { _user_id: user.id });

    if (candidatesError) throw candidatesError;

    const targetCandidates = candidates.filter((c: any) =>
      candidateIds.includes(c.id)
    );

    if (targetCandidates.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid candidates found" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Send emails
    const results = [];
    for (const candidate of targetCandidates) {
      try {
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: fromName
            ? `${fromName} <onboarding@resend.dev>`
            : "ATS <onboarding@resend.dev>",
          to: [candidate.email],
          subject: subject.replace("{{candidate_name}}", candidate.full_name),
          html: content.replace(/{{candidate_name}}/g, candidate.full_name),
        });

        if (emailError) {
          throw emailError;
        }

        results.push({
          candidateId: candidate.id,
          email: candidate.email,
          success: true,
          messageId: emailData?.id,
        });

        console.log(`Email sent to ${candidate.email}:`, emailData);
      } catch (error: any) {
        console.error(`Failed to send email to ${candidate.email}:`, error);
        results.push({
          candidateId: candidate.id,
          email: candidate.email,
          success: false,
          error: error.message,
        });
      }
    }

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-bulk-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
