'use client';

import { useState } from 'react';
import { generateCatchyTitles } from '@/ai/flows/generate-catchy-titles';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, ArrowLeft } from 'lucide-react';
import { SourceManager } from './source-manager';

export function ContentCreator() {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [titles, setTitles] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: 'Topic is required',
        description: 'Please provide a topic to generate titles.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setTitles([]);

    try {
      const result = await generateCatchyTitles({ topic });
      setTitles(result.titles);
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : 'An unknown error occurred.';
      toast({
        title: 'Error generating titles',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTitleSelect = (title: string) => {
    setSelectedTitle(title);
  };
  
  const handleBack = () => {
    setSelectedTitle(null);
  }

  if (selectedTitle) {
    return <SourceManager selectedTitle={selectedTitle} onBack={handleBack} />;
  }

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">
            Content Creator
          </CardTitle>
          <CardDescription>
            Provide a topic to generate catchy, content-worthy titles for your
            podcast.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label
              htmlFor="topic"
              className="text-lg font-semibold font-headline"
            >
              Podcast Topic
            </Label>
            <div className="flex gap-2">
              <Input
                id="topic"
                placeholder="e.g., Azure Arc-enabled Kubernetes"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
                className="text-base"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
              />
              <Button onClick={handleGenerate} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-5 w-5" />
                )}
                {isLoading ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </div>
        </CardContent>
        {titles.length > 0 && (
          <CardFooter>
            <div className="w-full">
              <h3 className="font-headline text-xl font-semibold mb-3">
                Select a Title
              </h3>
              <ul className="space-y-2">
                {titles.map((title, index) => (
                  <li
                    key={index}
                    className="text-foreground/90 p-3 rounded-md border hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                    onClick={() => handleTitleSelect(title)}
                  >
                    {title}
                  </li>
                ))}
              </ul>
            </div>
          </CardFooter>
        )}
      </Card>
    </>
  );
}
