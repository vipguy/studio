
"use client";

import Image from "next/image";
import * as React from "react";
import { AlertCircle, Download, RefreshCw, Sparkles, Wand2, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { handleGenerateImageAction, type GenerateImageActionResult } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";

export default function ImaginAIHomePage() {
  const [prompt, setPrompt] = React.useState<string>("");
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [improvedPrompt, setImprovedPrompt] = React.useState<string | null>(null);
  const [originalPromptForDisplay, setOriginalPromptForDisplay] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setImageUrl(null);
    setError(null);
    setImprovedPrompt(null);
    setOriginalPromptForDisplay(prompt);

    const result: GenerateImageActionResult = await handleGenerateImageAction(prompt);

    if (result.error) {
      setError(result.error);
    } else if (result.imageUrl) {
      setImageUrl(result.imageUrl);
    }
    if (result.improvedPrompt) {
      setImprovedPrompt(result.improvedPrompt);
    }
    
    setIsLoading(false);
  };

  const handleRegenerate = () => {
    if (!originalPromptForDisplay || isLoading) return;
    // Reuse the handleSubmit logic by temporarily setting prompt state
    // and then calling a synthetic form submission or refactoring handleSubmit.
    // For simplicity here, directly call action.
    const currentPrompt = originalPromptForDisplay;
    setPrompt(currentPrompt); // ensure prompt state is up-to-date if user cleared input
    
    setIsLoading(true);
    setImageUrl(null);
    setError(null);
    setImprovedPrompt(null);

    handleGenerateImageAction(currentPrompt).then(result => {
      if (result.error) {
        setError(result.error);
      } else if (result.imageUrl) {
        setImageUrl(result.imageUrl);
      }
      if (result.improvedPrompt) {
        setImprovedPrompt(result.improvedPrompt);
      }
      setIsLoading(false);
    });
  };
  
  const handleDownload = () => {
    if (!imageUrl || !originalPromptForDisplay) return;
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = imageUrl;
    
    // Sanitize prompt for filename (simple example)
    const safePrompt = originalPromptForDisplay.replace(/[^a-z0-9_]/gi, '_').substring(0, 30);
    link.download = `imaginai_${safePrompt || 'generated_image'}.png`; // Assuming images are PNGs
    
    // Programmatically click the link to trigger the download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
  };


  return (
    <TooltipProvider>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-blue-100 dark:from-background dark:to-blue-900 p-4 sm:p-6 md:p-8">
        <Card className="w-full max-w-2xl shadow-2xl rounded-xl overflow-hidden">
          <CardHeader className="bg-primary/10 dark:bg-primary/20 p-6">
            <div className="flex items-center space-x-3">
              <Wand2 className="h-10 w-10 text-primary" />
              <div>
                <CardTitle className="text-3xl font-bold tracking-tight text-primary">ImaginAI</CardTitle>
                <CardDescription className="text-md text-foreground/80">
                  Transform your ideas into stunning visuals.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="prompt" className="text-lg font-medium text-foreground/90">
                  Enter your image prompt:
                </Label>
                <Input
                  id="prompt"
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A majestic lion in a surreal landscape"
                  className="mt-2 text-base p-3 rounded-lg focus:ring-2 focus:ring-primary"
                  disabled={isLoading}
                  aria-label="Image prompt"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full text-lg py-3 rounded-lg font-semibold transition-all duration-150 ease-in-out transform hover:scale-105" 
                disabled={isLoading || !prompt.trim()}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Image
                  </>
                )}
              </Button>
            </form>

            {error && (
              <Alert variant="destructive" className="mt-4 rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {improvedPrompt && originalPromptForDisplay && improvedPrompt !== originalPromptForDisplay && !error && (
              <Alert variant="default" className="mt-4 rounded-lg bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-700 dark:text-blue-300">Prompt Enhanced</AlertTitle>
                <AlertDescription className="text-blue-600 dark:text-blue-400">
                  For best results, we used this prompt: <br /><strong>{improvedPrompt}</strong>
                </AlertDescription>
              </Alert>
            )}


            <div className="mt-6 min-h-[300px] flex items-center justify-center bg-muted/50 dark:bg-muted/20 rounded-lg p-4 border border-dashed border-foreground/20">
              {isLoading && (
                 <div className="space-y-4 w-full">
                    <Skeleton className="h-[250px] w-full rounded-md bg-muted" data-ai-hint="loading indicator" />
                    <Skeleton className="h-4 w-3/4 mx-auto bg-muted" />
                    <Skeleton className="h-4 w-1/2 mx-auto bg-muted" />
                  </div>
              )}
              {!isLoading && imageUrl && (
                <div className="relative group aspect-square w-full max-w-md mx-auto">
                  <Image
                    src={imageUrl}
                    alt={improvedPrompt || originalPromptForDisplay || "Generated image"}
                    layout="fill"
                    objectFit="contain"
                    className="rounded-md shadow-lg"
                    data-ai-hint="generated art"
                  />
                </div>
              )}
              {!isLoading && !imageUrl && !error && (
                <div className="text-center text-foreground/60">
                  <Wand2 className="mx-auto h-12 w-12 mb-2" />
                  <p>Your generated image will appear here.</p>
                </div>
              )}
               {!isLoading && !imageUrl && error && (
                <div className="text-center text-destructive/80">
                  <AlertCircle className="mx-auto h-12 w-12 mb-2" />
                  <p>Image generation failed. Try a different prompt.</p>
                </div>
              )}
            </div>
          </CardContent>

          {(imageUrl || error) && !isLoading && (
            <CardFooter className="p-6 bg-primary/5 dark:bg-primary/10 border-t flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <Button 
                onClick={handleRegenerate} 
                variant="outline" 
                className="w-full sm:w-auto text-base py-2.5 rounded-lg border-primary text-primary hover:bg-primary/10" 
                disabled={isLoading || !originalPromptForDisplay}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
              {imageUrl && (
                <Button 
                  onClick={handleDownload} 
                  variant="default" 
                  className="w-full sm:w-auto text-base py-2.5 rounded-lg bg-accent hover:bg-accent/90"
                  disabled={isLoading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Image
                </Button>
              )}
            </CardFooter>
          )}
        </Card>
        <footer className="mt-8 text-center text-sm text-foreground/60">
          <p>&copy; {new Date().getFullYear()} ImaginAI. Powered by AI.</p>
           <p className="text-xs mt-1">
            Prompts may be modified to improve results and ensure safety.
          </p>
        </footer>
      </div>
    </TooltipProvider>
  );
}
