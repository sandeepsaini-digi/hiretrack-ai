import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Resume } from '@/models/Resume';
import { z } from 'zod';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const RequestSchema = z.object({
  resumeId: z.string(),
  jobDescription: z.string().min(50, 'Job description too short'),
  jobTitle: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { resumeId, jobDescription, jobTitle } = RequestSchema.parse(body);

    await connectDB();
    const resume = await Resume.findOne({ _id: resumeId, userId: session.user.id }).lean();

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    const resumeText = resumeToText(resume as any);

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) analyzer and career coach.
Analyze the resume against the job description and provide detailed, actionable feedback.
Always respond with valid JSON.`;

    const userPrompt = `Analyze this resume for the position: "${jobTitle}"

JOB DESCRIPTION:
${jobDescription}

CANDIDATE RESUME:
${resumeText}

Provide a comprehensive ATS analysis in this exact JSON format:
{
  "overallScore": <number 0-100>,
  "breakdown": {
    "keywordMatch": { "score": <0-40>, "maxScore": 40, "details": "..." },
    "softSkills": { "score": <0-15>, "maxScore": 15, "details": "..." },
    "formatting": { "score": <0-20>, "maxScore": 20, "details": "..." },
    "quantifiedAchievements": { "score": <0-15>, "maxScore": 15, "details": "..." },
    "lengthReadability": { "score": <0-10>, "maxScore": 10, "details": "..." }
  },
  "matchedKeywords": ["keyword1", "keyword2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "criticalMissing": ["most important missing keywords"],
  "suggestions": [
    {
      "priority": "high|medium|low",
      "section": "skills|experience|summary|education",
      "suggestion": "Specific actionable suggestion",
      "example": "Example of how to improve"
    }
  ],
  "jobMatchPercentage": <number 0-100>,
  "summary": "2-3 sentence overall assessment"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const analysis = JSON.parse(completion.choices[0].message.content ?? '{}');

    // Save analysis to DB
    await Resume.findByIdAndUpdate(resumeId, {
      $push: {
        atsAnalyses: {
          jobTitle,
          jobDescriptionSnippet: jobDescription.slice(0, 200),
          score: analysis.overallScore,
          matchedKeywords: analysis.matchedKeywords,
          missingKeywords: analysis.missingKeywords,
          analyzedAt: new Date(),
        },
      },
    });

    return NextResponse.json({ analysis });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('[Resume Analyze]', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}

function resumeToText(resume: any): string {
  const parts: string[] = [];

  if (resume.summary) parts.push(`SUMMARY:\n${resume.summary}`);

  if (resume.experience?.length) {
    parts.push('EXPERIENCE:');
    for (const exp of resume.experience) {
      parts.push(
        `${exp.title} at ${exp.company} (${exp.startDate} - ${exp.endDate ?? 'Present'})\n${exp.bullets?.join('\n') ?? ''}`
      );
    }
  }

  if (resume.skills?.length) {
    parts.push(`SKILLS:\n${resume.skills.join(', ')}`);
  }

  if (resume.education?.length) {
    parts.push('EDUCATION:');
    for (const edu of resume.education) {
      parts.push(`${edu.degree} - ${edu.institution} (${edu.year})`);
    }
  }

  return parts.join('\n\n');
}
