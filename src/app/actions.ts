
'use server';

import type { ImprovePromptOutput } from '@/ai/flows/prompt-improvement';
import { improvePrompt } from '@/ai/flows/prompt-improvement';
import type { GenerateImageOutput } from '@/ai/flows/image-generation';
import { generateImage } from '@/ai/flows/image-generation';

export interface GenerateImageActionResult {
  imageUrl?: string;
  improvedPrompt?: string;
  originalPrompt?: string;
  error?: string;
}

export async function handleGenerateImageAction(originalPromptValue: string): Promise<GenerateImageActionResult> {
  const originalPrompt = originalPromptValue.trim();
  if (!originalPrompt) {
    return { error: 'Prompt cannot be empty.', originalPrompt };
  }

  try {
    // 1. Improve Prompt
    const promptImprovementResult: ImprovePromptOutput = await improvePrompt({ prompt: originalPrompt });
    const { improvedPrompt, originalPrompt: auditPrompt } = promptImprovementResult;

    if (!improvedPrompt) {
      return { 
        error: 'Prompt was blocked or could not be improved. Please try a different prompt.', 
        originalPrompt: auditPrompt,
        improvedPrompt: originalPrompt // Show original if improvement failed
      };
    }
    
    // 2. Generate Image
    const imageGenerationResult: GenerateImageOutput = await generateImage({ prompt: improvedPrompt });
    const { imageUrl } = imageGenerationResult;

    if (!imageUrl) {
      return { error: 'Failed to generate image. No image URL received.', improvedPrompt, originalPrompt: auditPrompt };
    }

    return { imageUrl, improvedPrompt, originalPrompt: auditPrompt };
  } catch (e: any) {
    console.error('Error in handleGenerateImageAction:', e);
    const returnedImprovedPrompt = e.improvedPrompt || (e.cause as any)?.improvedPrompt || originalPrompt;
    if (e.message && (e.message.toLowerCase().includes('blocked') || e.message.toLowerCase().includes('sensitive'))) {
         return { error: 'Your prompt was blocked by the content filter. Please revise your prompt.', improvedPrompt: returnedImprovedPrompt, originalPrompt };
    }
    return { error: e.message || 'An unexpected error occurred during image generation.', improvedPrompt: returnedImprovedPrompt, originalPrompt };
  }
}
