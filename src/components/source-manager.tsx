'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

type SourceManagerProps = {
  selectedTitle: string;
  onBack: () => void;
};

export function SourceManager({ selectedTitle, onBack }: SourceManagerProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-4">
           <Button variant="outline" size="icon" onClick={onBack} className="shrink-0">
             <ArrowLeft className="h-4 w-4" />
             <span className="sr-only">Back</span>
           </Button>
           <div>
            <CardTitle className="font-headline text-3xl">Add Sources</CardTitle>
            <CardDescription>
              Provide sources for the title: "{selectedTitle}"
            </CardDescription>
           </div>
        </div>
      </CardHeader>
      <CardContent>
        <p>Source management UI will go here.</p>
      </CardContent>
      <CardFooter>
        {/* Footer content for source manager */}
      </CardFooter>
    </Card>
  );
}
