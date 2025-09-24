'use client';

import type { ScriptData } from './source-manager';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileJson, FileText, Link as LinkIcon, Sparkles, Star } from 'lucide-react';

type ScriptDisplayProps = {
  scriptData: ScriptData;
  onBack?: () => void;
};

export function ScriptDisplay({ scriptData, onBack }: ScriptDisplayProps) {
  const { script, takeaways, references, topic } = scriptData;

  const handleJsonExport = () => {
    const data = {
      topic,
      script,
      keyTakeaways: takeaways,
      references,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${topic.replace(/\s+/g, '_').toLowerCase()}_script.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleTxtExport = () => {
    let docContent = `Topic: ${topic}\n\n`;
    docContent += `--- SCRIPT ---\n\n${script}\n\n`;
    docContent += `--- KEY TAKEAWAYS ---\n\n${takeaways.join('\n\n')}\n\n`;
    docContent += `--- REFERENCES ---\n\n${references.join('\n')}`;

    const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${topic.replace(/\s+/g, '_').toLowerCase()}_script.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleDocExport = () => {
    let docContent = `<html><head><meta charset="utf-8"><title>${topic}</title></head><body>`;
    docContent += `<h1>${topic}</h1>`;
    docContent += `<h2>Script</h2><div>${script.replace(/\n/g, '<br>')}</div>`;
    docContent += `<h2>Key Takeaways</h2><ul>${takeaways.map(t => `<li>${t}</li>`).join('')}</ul>`;
    docContent += `<h2>References</h2><ul>${references.map(r => `<li><a href="${r}">${r}</a></li>`).join('')}</ul>`;
    docContent += `</body></html>`;

    const blob = new Blob([docContent], { type: 'application/msword;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${topic.replace(/\s+/g, '_').toLowerCase()}_script.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const renderScriptContent = (content: string) => {
    return content.split('\n---\n').map((part, index) => {
      const paragraphs = part.trim().split('\n').filter(p => p.trim() !== '');
      const isCallout = index % 2 === 1 || part.trim().startsWith('Callout:');

      if (isCallout) {
        return (
          <div key={index} className="my-4 p-4 border-l-4 border-accent bg-accent/10 rounded-r-lg" >
            <p className="font-semibold font-headline text-accent mb-2 flex items-center">
              <Sparkles className="inline-block mr-2 h-4 w-4" />
              Callout
            </p>
            {paragraphs.map((p, pIndex) => (
              <p key={pIndex} className="mb-2 last:mb-0 text-foreground/90">
                {p.replace('Callout:', '').trim()}
              </p>
            ))}
          </div>
        );
      } else {
        return (
          <div key={index}>
            {paragraphs.map((p, pIndex) => {
              if (p.startsWith('#')) {
                return (
                  <h3 key={pIndex} className="text-xl font-headline font-semibold mt-6 mb-3 border-b pb-2">
                    {p.replace(/#/g, '').trim()}
                  </h3>
                );
              }
              return (
                <p key={pIndex} className="mb-4 text-foreground/90 leading-relaxed">
                  {p}
                </p>
              );
            })}
          </div>
        );
      }
    });
  };

  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <CardTitle className="font-headline text-3xl">Your Podcast Script</CardTitle>
            <CardDescription>Generated script for: "{topic}"</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="script">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="script">Script</TabsTrigger>
            <TabsTrigger value="details">Details & References</TabsTrigger>
          </TabsList>
          <TabsContent value="script" className="mt-4 prose max-w-none">
            <div className="p-4 border rounded-md bg-background/50">
                {renderScriptContent(script)}
            </div>
          </TabsContent>
          <TabsContent value="details" className="mt-4 space-y-6">
            <div>
                <h3 className="font-headline text-xl font-semibold flex items-center mb-3">
                    <Star className="mr-2 h-5 w-5 text-accent"/>
                    Key Takeaways
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                    {takeaways.map((takeaway, index) => (
                        <li key={index} className="text-foreground/90">{takeaway}</li>
                    ))}
                </ul>
            </div>
            <div>
                <h3 className="font-headline text-xl font-semibold flex items-center mb-3">
                    <LinkIcon className="mr-2 h-5 w-5 text-accent"/>
                    References
                </h3>
                <ul className="space-y-2">
                    {references.map((ref, index) => (
                        <li key={index}>
                            <a href={ref} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                                {ref}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end gap-4 bg-muted/50 p-4 rounded-b-lg">
        <Button onClick={handleJsonExport} variant="outline" className="metallic-button">
          <FileJson className="mr-2 h-4 w-4" />
          Export JSON
        </Button>
        <Button onClick={handleTxtExport} variant="outline" className="metallic-button">
          <FileText className="mr-2 h-4 w-4" />
          Export TXT
        </Button>
        <Button onClick={handleDocExport} className="metallic-button">
          <FileText className="mr-2 h-4 w-4" />
          Export DOC
        </Button>
      </CardFooter>
    </Card>
  );
}
