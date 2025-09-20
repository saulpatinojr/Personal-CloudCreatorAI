import { Mic } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-card border-b sticky top-0 z-10">
      <div className="container mx-auto p-4 flex items-center gap-3">
        <div className="bg-primary text-primary-foreground p-2 rounded-lg">
          <Mic className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold font-headline text-primary">
          CloudCreatorAI
        </h1>
      </div>
    </header>
  );
}
