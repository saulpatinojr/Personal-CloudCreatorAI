// src/app/api/genkit/[slug]/route.ts
import '@/ai/dev';
import { ai } from '@/ai/genkit';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const body = await request.json();
    
    // Handle flow execution
    if (slug === 'generateCatchyTitlesFlow') {
      const { generateCatchyTitlesFlow } = await import('@/ai/flows/generate-catchy-titles');
      const result = await generateCatchyTitlesFlow(body);
      return NextResponse.json(result);
    }
    
    return NextResponse.json({ error: 'Flow not found' }, { status: 404 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
