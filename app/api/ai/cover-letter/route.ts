import { NextRequest } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Resume } from '@/models/Resume';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const {
    jobTitle,
    company,
    jobDescription,
    resumeId,
    tone = 'professional',
    additionalContext = '',
  } = await req.json();

  await connectDB();
  const resume = await Resume.findOne({ _id: resumeId, userId: session.user.id }).lean();

  const resumeSummary = resume
    ? `
Name: ${(resume as any).personalInfo?.name}
Current Role: ${(resume as any).experience?.[0]?.title} at ${(resume as any).experience?.[0]?.company}
Key Skills: ${(resume as any).skills?.slice(0, 10).join(', ')}
Years of Experience: ${(resume as any).yearsOfExperience ?? 'N/A'}
Notable Achievement: ${(resume as any).experience?.[0]?.bullets?.[0] ?? ''}
`
    : '';

  const toneGuide = {
    professional: 'formal, confident, and results-focused',
    enthusiastic: 'energetic, passionate, and forward-looking',
    concise: 'brief, direct, and to-the-point (under 250 words)',
  }[tone as string] ?? 'professional';

  const result = await streamText({
    model: openai('gpt-4o'),
    system: `You are an expert career coach who writes compelling, personalized cover letters.
Write in a ${toneGuide} tone.
The cover letter should:
- Open with a strong, specific hook (NOT "I am writing to apply for...")
- Reference specific things about the company showing genuine interest
- Connect 2-3 specific achievements to the job requirements
- Close with a clear call to action
- Be 3-4 paragraphs, around 300-350 words (unless tone is concise)
- Sound human, not AI-generated`,

    prompt: `Write a cover letter for this position:

Job Title: ${jobTitle}
Company: ${company}

Job Description:
${jobDescription}

Candidate Background:
${resumeSummary}

${additionalContext ? `Additional Context: ${additionalContext}` : ''}

Write the complete cover letter starting with "Dear Hiring Manager" or the hiring manager's name if provided.`,

    temperature: 0.7,
    maxTokens: 700,
  });

  return result.toDataStreamResponse();
}
