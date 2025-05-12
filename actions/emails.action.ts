import { Resend } from "resend";

interface SendEmail {
  to: string;
  react: any;
  subject: string;
}

export async function sendEmail({ to, react, subject }: SendEmail) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const data = await resend.emails.send({
      from: "Fintrack <onboarding@resend.dev>",
      to,
      subject,
      react,
    });
  } catch (error) {
    console.log("Error sending email", error);
    return { success: false, error };
  }
}
