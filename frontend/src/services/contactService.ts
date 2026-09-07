export type ContactInquiryInput = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export async function submitContactInquiry(input: ContactInquiryInput): Promise<void> {
  const response = await fetch(`${apiUrl}/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('CONTACT_SUBMISSION_FAILED');
  }
}
