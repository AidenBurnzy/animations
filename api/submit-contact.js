// Serverless function to handle contact form submissions
// Works with Vercel or Netlify serverless functions

import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';

const sqlClient = (() => {
    if (!process.env.DATABASE_URL) {
        console.warn('DATABASE_URL is not set. Contact submissions will not be persisted.');
        return null;
    }

    try {
        return neon(process.env.DATABASE_URL);
    } catch (error) {
        console.error('Failed to initialize Neon client:', error);
        return null;
    }
})();

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { name, email, company, phone, service, timeline, message } = req.body;

        // Validate required fields
        if (!name || !email || !company || !phone || !service || !timeline || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Initialize Neon database connection (only if DATABASE_URL is provided)
        if (sqlClient) {
            try {
                await sqlClient`
                    INSERT INTO contact_submissions (name, email, company, phone, service, timeline, message)
                    VALUES (${name}, ${email}, ${company}, ${phone}, ${service}, ${timeline}, ${message})
                `;
            } catch (dbError) {
                console.error('Database error:', dbError);
                // Continue to send email even if database fails
            }
        }

        // Send email notification using Resend
        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
        const toEmail = process.env.RESEND_TO_EMAIL || 'founder.auctusventures@gmail.com';

        await resend.emails.send({
            from: fromEmail,
            to: toEmail,
            subject: `New Contact Form Submission from ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #5d56ff;">New Contact Form Submission</h2>
                    
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Contact Information</h3>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                        <p><strong>Company:</strong> ${company}</p>
                        <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
                    </div>
                    
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Project Details</h3>
                        <p><strong>Service Interest:</strong> ${service}</p>
                        <p><strong>Timeline:</strong> ${timeline}</p>
                    </div>
                    
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Message</h3>
                        <p style="white-space: pre-wrap;">${message}</p>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; margin-top: 30px;">
                        Submitted at: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}
                    </p>
                </div>
            `
        });

        return res.status(200).json({ 
            success: true, 
            message: 'Form submitted successfully' 
        });

    } catch (error) {
        console.error('Form submission error:', error);
        return res.status(500).json({ 
            error: 'Failed to submit form',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
