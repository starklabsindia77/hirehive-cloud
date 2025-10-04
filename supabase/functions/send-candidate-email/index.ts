import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  candidateName: string;
  subject: string;
  content: string;
  template?: 'interview_invite' | 'rejection' | 'offer' | 'general';
  templateData?: Record<string, any>;
}

const emailTemplates = {
  interview_invite: (data: Record<string, any>) => `
    <h2>Interview Invitation</h2>
    <p>Dear ${data.candidateName},</p>
    <p>We are pleased to invite you for an interview for the <strong>${data.jobTitle}</strong> position.</p>
    <p><strong>Interview Details:</strong></p>
    <ul>
      <li>Date: ${data.interviewDate}</li>
      <li>Time: ${data.interviewTime}</li>
      <li>Duration: ${data.duration || '60 minutes'}</li>
      <li>Type: ${data.interviewType}</li>
      ${data.location ? `<li>Location: ${data.location}</li>` : ''}
      ${data.meetingLink ? `<li>Meeting Link: <a href="${data.meetingLink}">${data.meetingLink}</a></li>` : ''}
    </ul>
    <p>Please confirm your attendance by replying to this email.</p>
    <p>Best regards,<br/>${data.organizationName}</p>
  `,
  rejection: (data: Record<string, any>) => `
    <h2>Application Update</h2>
    <p>Dear ${data.candidateName},</p>
    <p>Thank you for your interest in the <strong>${data.jobTitle}</strong> position at ${data.organizationName}.</p>
    <p>After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.</p>
    <p>We appreciate the time you invested in the application process and wish you the best in your job search.</p>
    <p>Best regards,<br/>${data.organizationName}</p>
  `,
  offer: (data: Record<string, any>) => `
    <h2>Job Offer</h2>
    <p>Dear ${data.candidateName},</p>
    <p>We are delighted to offer you the position of <strong>${data.jobTitle}</strong> at ${data.organizationName}.</p>
    <p><strong>Offer Details:</strong></p>
    <ul>
      ${data.salary ? `<li>Salary: ${data.salary}</li>` : ''}
      ${data.startDate ? `<li>Start Date: ${data.startDate}</li>` : ''}
      ${data.benefits ? `<li>Benefits: ${data.benefits}</li>` : ''}
    </ul>
    <p>Please review the attached offer letter and let us know your decision by ${data.responseDeadline || 'your earliest convenience'}.</p>
    <p>We look forward to welcoming you to our team!</p>
    <p>Best regards,<br/>${data.organizationName}</p>
  `,
  general: (data: Record<string, any>) => data.content || ''
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      to, 
      candidateName, 
      subject, 
      content,
      template,
      templateData 
    }: EmailRequest = await req.json();

    if (!to || !subject) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    let emailHtml = content;
    
    if (template && emailTemplates[template]) {
      emailHtml = emailTemplates[template]({ 
        candidateName, 
        ...templateData 
      });
    }

    const emailResponse = await resend.emails.send({
      from: "NexHire <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
