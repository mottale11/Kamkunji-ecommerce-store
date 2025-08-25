import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, subject, text, html } = await request.json();

    // Validate required fields
    if (!to || !subject || !text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user is authenticated
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = user?.user_metadata?.role === 'admin';
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Kamkunji Ndogo <noreply@kamkunjindogo.com>', // Update with your domain
      to: Array.isArray(to) ? to : [to],
      subject,
      text,
      html: html || `<p>${text}</p>`,
    });

    if (error) {
      console.error('Error sending email:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    // Log the email in your database if needed
    await supabase
      .from('email_logs')
      .insert([
        { 
          to_email: to, 
          subject, 
          status: 'sent',
          sent_at: new Date().toISOString(),
          user_id: user?.id,
          metadata: { email_id: data?.id }
        },
      ]);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in send-email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add schema for email_logs table (run this in Supabase SQL editor)
/*
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for security
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for email_logs
CREATE POLICY "Users can view their own email logs" 
  ON public.email_logs FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all email logs"
  ON public.email_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  ));
*/
