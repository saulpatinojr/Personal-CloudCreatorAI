'use client';

import * as React from 'react';
import { useState } from 'react';
import { generateScriptFromSources } from '@/ai/flows/generate-script-from-sources';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from './ui/button';
import { ArrowLeft, FileText, Link as LinkIcon, Plus, Text, Trash2, Wand2 } from 'lucide-react';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ScriptDisplay } from './script-display';
import {runFlow} from '@genkit-ai/next/client';

type SourceManagerProps = {
  selectedTitle: string;
  onBack: () => void;
};

export type ScriptData = {
  topic: string;
  script: string;
  takeaways: string[];
  references: string[];
};

type Source = {
  id: string;
  type: 'url' | 'pdf' | 'text';
  name: string;
  content: string;
};

export function SourceManager({ selectedTitle, onBack }: SourceManagerProps) {
  const [sources, setSources] = useState<Source[]>([]);
  const [urls, setUrls] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scriptData, setScriptData] = useState<ScriptData | null>(null);

  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAddUrls = () => {
    const urlArray = urls
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      });

    if (urlArray.length === 0 && urls.trim() !== '') {
      toast({
        title: 'Invalid URLs',
        description: 'Please enter at least one valid URL.',
        variant: 'destructive',
      });
      return;
    }

    const newSources = urlArray
      .filter((url) => !sources.some(s => s.type === 'url' && s.content === url))
      .map(url => ({
        id: crypto.randomUUID(),
        type: 'url' as const,
        name: url,
        content: url
      }));

    setSources([...sources, ...newSources]);
    setUrls('');
  };

  const handleAddText = () => {
    const textContent = prompt("Paste your text content here:");
    if (textContent && textContent.trim()) {
      const newSource: Source = {
        id: crypto.randomUUID(),
        type: 'text',
        name: `Text Snippet (${textContent.substring(0, 20)}...)`,
        content: textContent,
      };
      setSources([...sources, newSource]);
    }
  };

  const handlePdfUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
       // In a real app, you'd process the file here (e.g., upload and extract text)
      // For this demo, we'll just use the file name as the content.
      const newSource: Source = {
        id: crypto.randomUUID(),
        type: 'pdf',
        name: file.name,
        content: file.name,
      };
      setSources([...sources, newSource]);
    } else if (file) {
      toast({
        title: 'Invalid File Type',
        description: 'Please select a PDF file.',
        variant: 'destructive',
      });
    }
    // Reset file input
    if(event.target) event.target.value = '';
  };

  const handleRemoveSource = (idToRemove: string) => {
    setSources(sources.filter((source) => source.id !== idToRemove));
  };
  
  const handleGenerateScript = async () => {
    if (sources.length === 0) {
        toast({
            title: 'No sources provided',
            description: 'Please add at least one source to generate the script.',
            variant: 'destructive'
        });
        return;
    }
    
    setIsLoading(true);
    setScriptData(null);
    
    try {
        const result = await runFlow(generateScriptFromSources, { topic: selectedTitle, sources: sources.map(({id, ...rest}) => rest) });
        setScriptData({
            topic: selectedTitle,
            script: result.script,
            takeaways: result.takeaways,
            references: result.references
        });
    } catch (e) {
        console.error('Raw API Error:', e);
        toast({
            title: 'Error Generating Script',
            description: 'An unexpected error occurred. Please try again later.',
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  }
  
  const renderSourceIcon = (type: Source['type']) => {
    switch (type) {
        case 'url': return <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />;
        case 'pdf': return <FileText className="h-4 w-4 text-muted-foreground shrink-0" />;
        case 'text': return <Text className="h-4 w-4 text-muted-foreground shrink-0" />;
        default: return null;
    }
  }
  
  if (scriptData) {
      return <ScriptDisplay scriptData={scriptData} />;
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <div>
            <CardTitle className="font-headline text-3xl">
              Add Sources
            </CardTitle>
            <CardDescription>
              Provide sources for the title: "{selectedTitle}"
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="urls" className="text-lg font-semibold font-headline">
              Source URLs
            </Label>
            <Textarea
              id="urls"
              placeholder="https://docs.microsoft.com/...\nhttps://azure.microsoft.com/en-us/blog/..."
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              rows={4}
              disabled={isLoading}
            />
             <Button onClick={handleAddUrls} disabled={isLoading || !urls.trim()}>
                <Plus className="mr-2" /> Add URLs
            </Button>
          </div>
          <div className="space-y-2">
            <Label className="text-lg font-semibold font-headline">
              Additional Sources
            </Label>
            <div className='flex gap-2'>
                <Button onClick={handlePdfUploadClick} disabled={isLoading} variant="outline">
                    <FileText className="mr-2" /> Add PDF
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="application/pdf"
                />
                 <Button onClick={handleAddText} disabled={isLoading} variant="outline">
                    <Text className="mr-2" /> Add Text
                </Button>
            </div>
          </div>
        </div>
        
        {sources.length > 0 && (
          <div>
            <h3 className="font-headline text-xl font-semibold mb-3 border-t pt-6">
              Added Sources
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center justify-between p-2 rounded-md border bg-muted/50"
                >
                  <div className="flex items-center gap-2 truncate">
                    {renderSourceIcon(source.type)}
                    <span className="truncate text-sm text-foreground/90">
                      {source.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSource(source.id)}
                    className="shrink-0 h-8 w-8"
                    aria-label="Remove source"
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end bg-muted/50 p-4 rounded-b-lg">
        <Button onClick={handleGenerateScript} disabled={isLoading || sources.length === 0}>
            {isLoading ? (
                <>
                    <Wand2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Script...
                </>
            ) : (
                <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Generate Script
                </>
            )}
        </Button>
      </CardFooter>
    </Card>
  );
}
