'use client';

import { useState } from 'react';
import { readMcpFile } from '@/ai/flows/read-mcp-file';
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
import { Loader2, FileSearch } from 'lucide-react';

export function McpReader() {
  const [path, setPath] = useState('example.txt');
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const { toast } = useToast();

  const handleReadFile = async () => {
    if (!path.trim()) {
      toast({
        title: 'File path is required',
        description: 'Please enter a path to read.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setContent(null);

    try {
      const result = await readMcpFile({ path });
      setContent(result.content);
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : 'An unknown error occurred.';
      toast({
        title: 'Error reading file',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">
          MCP File Reader
        </CardTitle>
        <CardDescription>
          Test the MCP server connection by reading a file.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="path" className="text-lg font-semibold font-headline">
            File Path
          </Label>
          <div className="flex gap-2">
            <Input
              id="path"
              placeholder="e.g., example.txt"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              disabled={isLoading}
              className="text-base"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleReadFile();
                }
              }}
            />
            <Button onClick={handleReadFile} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <FileSearch className="mr-2 h-5 w-5" />
              )}
              {isLoading ? 'Reading...' : 'Read File'}
            </Button>
          </div>
        </div>
      </CardContent>
      {content && (
        <CardFooter>
          <div className="w-full">
            <h3 className="font-headline text-xl font-semibold mb-3">
              File Content
            </h3>
            <pre className="p-4 bg-muted rounded-md text-sm whitespace-pre-wrap">
              <code>{content}</code>
            </pre>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
