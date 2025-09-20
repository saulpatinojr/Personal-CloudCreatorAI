'use client';

import { useState } from 'react';
import { generateScriptFromTopic } from '@/ai/flows/generate-script-from-topic';
import { summarizeArticle } from '@/ai/flows/summarize-article';
import { insertCallouts } from '@/ai/flows/insert-callouts';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2 } from 'lucide-react';
import { ScriptDisplay } from './script-display';

export type ScriptData = {
  topic: string;
  script: string;
  takeaways: string[];
  references: string[];
};

export function ScriptGenerator() {
  const [topic, setTopic] = useState('');
  const [urls, setUrls] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptData, setScriptData] = useState<ScriptData | null>(null);

  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: 'Topic is required',
        description: 'Please provide a topic for your podcast script.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setScriptData(null);

    try {
      let takeaways: string[] = [];
      let references: string[] = [];
      let summaryText = '';

      if (urls.trim()) {
        const urlArray = urls.trim().split('\n').filter(u => {
            try {
                new URL(u);
                return true;
            } catch (e) {
                return false;
            }
        });
        
        if (urlArray.length > 0) {
            references = urlArray;
            const summaryPromises = urlArray.map(url => summarizeArticle({ articleUrl: url }));
            const summaryResults = await Promise.all(summaryPromises);
            takeaways = summaryResults.map(r => r.summary);
            summaryText = takeaways.join('\n\n');
        }
      }

      const topicToGenerate = summaryText ? `${topic}\n\nAdditional context from research:\n${summaryText}` : topic;

      const { script: initialScript } = await generateScriptFromTopic({ topic: topicToGenerate });
      const { scriptWithCallouts } = await insertCallouts({ script: initialScript, topic: topic });

      setScriptData({
        topic: topic,
        script: scriptWithCallouts,
        takeaways: takeaways.length > 0 ? takeaways : ['Summary not available from provided sources.'],
        references: references,
      });

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast({
        title: 'Error generating script',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Create a New Podcast Script</CardTitle>
          <CardDescription>
            Provide a topic and optional sources to generate a 20-minute script for your Azure podcast.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate();
            }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-lg font-semibold font-headline">Podcast Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., Azure Arc-enabled Kubernetes"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="urls" className="text-lg font-semibold font-headline">Source URLs (Optional)</Label>
              <Textarea
                id="urls"
                placeholder="https://docs.microsoft.com/...\nhttps://azure.microsoft.com/en-us/blog/..."
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                disabled={isLoading}
                rows={4}
                className="text-base"
              />
               <p className="text-sm text-muted-foreground">
                Enter one URL per line. These articles will be summarized and used as context.
              </p>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerate} disabled={isLoading} size="lg" className="w-full md:w-auto">
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-5 w-5" />
            )}
            {isLoading ? 'Generating...' : 'Generate Script'}
          </Button>
        </CardFooter>
      </Card>
      {scriptData && <ScriptDisplay scriptData={scriptData} />}
    </>
  );
}
