'use client';

import { useState } from 'react';
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
import { Loader2, Wand2 } from 'lucide-react';
import { SourceManager } from './source-manager';

export function ContentCreator() {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [titles, setTitles] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  const { toast } = useToast();

  // Helper: normalize many possible runFlow shapes into string[]
  const parseTitlesFromFlow = (raw: unknown): string[] => {
    if (raw == null) return [];

    // If it's already an array of strings
    if (Array.isArray(raw)) {
      return raw.map(String).map((s: string) => s.trim()).filter(Boolean);
    }

    // If raw is an object, check common properties
    if (typeof raw === 'object') {
      try {
        const obj = raw as Record<string, unknown>;

        // common: { titles: [...] }
        if (Array.isArray(obj.titles)) {
          return (obj.titles as unknown[]).map(String).map((s: string) => s.trim()).filter(Boolean);
        }

        // common: { output: 'json or text' }
        if (typeof obj.output === 'string') {
          const out = obj.output;
          // try parse json
          try {
            const p = JSON.parse(out);
            if (Array.isArray(p)) return p.map(String).map((s: string) => s.trim()).filter(Boolean);
            if (Array.isArray((p as any).titles)) return (p as any).titles.map(String).map((s: string) => s.trim()).filter(Boolean);
          } catch {
            // fallback to newline split
            return out.split(/\r?\n/).map((s: string) => s.trim()).filter(Boolean);
          }
        }

        // fallback: find any array value on the object
        for (const v of Object.values(obj)) {
          if (Array.isArray(v)) {
            return (v as unknown[]).map(String).map((s: string) => s.trim()).filter(Boolean);
          }
        }
      } catch {
        // pass through to next handling
      }
    }

    // If it's a string: JSON string, newline-separated, or plain
    if (typeof raw === 'string') {
      const str = raw.trim();
      // try JSON
      try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed)) return parsed.map(String).map((s: string) => s.trim()).filter(Boolean);
        if (Array.isArray((parsed as any).titles)) return (parsed as any).titles.map(String).map((s: string) => s.trim()).filter(Boolean);
      } catch {
        // not JSON
      }
      // fallback to newline split
      return str.split(/\r?\n/).map((s: string) => s.trim()).filter(Boolean);
    }

    // last resort
    return [];
  };

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
      const response = await fetch('/api/genkit/generateCatchyTitlesFlow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }
      
      const raw = await response.json();

      // debug information to help diagnose shape issues
      // Browser console (client): check devtools
      // Server logs: check terminal where next is running
      console.debug(`[runFlow raw] ${JSON.stringify(raw)}`);
      console.debug(`[runFlow typeof] ${typeof raw}`);
      try {
        console.debug(`[runFlow json] ${JSON.stringify(raw, null, 2)}`);
      } catch (err) {
        console.debug(`[runFlow stringify failed] ${err}`);
      }

      const parsed = parseTitlesFromFlow(raw);
      if (parsed.length === 0) {
        // nothing parsed — surface a helpful error to user but keep UI stable
        console.warn(`No titles parsed from runFlow response: ${JSON.stringify(raw)}`);
        toast({
          title: 'No titles returned',
          description: 'The service returned an unexpected response. Check the console for details.',
          variant: 'destructive',
        });
      }
      setTitles(parsed);
    } catch (e) {
      console.error(`Raw API Error: ${e}`);
      toast({
        title: 'Error Generating Titles',
        description: 'An unexpected error occurred. Please try again later.',
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
  };

  if (selectedTitle) {
    return <SourceManager selectedTitle={selectedTitle} onBack={handleBack} />;
  }

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Content Creator</CardTitle>
          <CardDescription>
            Provide a topic to generate catchy, content-worthy titles for your podcast.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-lg font-semibold font-headline">
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
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Wand2 className="mr-2 h-5 w-5" />}
                {isLoading ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </div>
        </CardContent>
        {titles.length > 0 && (
          <CardFooter>
            <div className="w-full">
              <h3 className="font-headline text-xl font-semibold mb-3">Select a Title</h3>
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