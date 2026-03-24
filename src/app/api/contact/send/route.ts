import { ContactEmail } from '@/lib/contact/ContactEmailTemplate';
import { respData, respErr } from '@/shared/lib/resp';
import { getEmailService } from '@/shared/services/email';

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    // Validate required fields
    if (!name || !email || !message) {
      return respErr('All fields are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return respErr('Invalid email address');
    }

    const emailService = await getEmailService();

    // Send email to the site owner
    const result = await emailService.sendEmail({
      to: 'info@roofcostai.com',
      subject: `Contact Form: ${name}`,
      react: ContactEmail({ name, email, message }),
      replyTo: email,
    });

    console.log('Contact form email result:', result);

    return respData({ success: true, message: 'Message sent successfully' });
  } catch (e) {
    console.log('Contact form send failed:', e);
    return respErr('Failed to send message. Please try again later.');
  }
}
