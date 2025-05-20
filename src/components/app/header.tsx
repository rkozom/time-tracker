import { Hourglass } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="py-6 mb-8 text-center border-b">
      <div className="container mx-auto flex items-center justify-center gap-3">
        <Hourglass className="h-8 w-8 text-primary" />
        <h1 className="text-4xl font-bold text-primary">ChronoFlow Time Tracker</h1>
      </div>
    </header>
  );
}