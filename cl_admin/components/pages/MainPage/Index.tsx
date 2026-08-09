'use client';

import { HeroSection, BentoGrid, InteractiveAiDemo, MonorepoStack } from './sections';

export default function MainPage() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* 3. Hero Section (Split Grid 7 - 5) */}
      <HeroSection />
      
      {/* 4. Bento Grid Features (3 Cards) */}
      <BentoGrid />
      
      {/* 5. Interactive AI Playground */}
      <InteractiveAiDemo />
      
      {/* 6. Monorepo Stack Summary */}
      <MonorepoStack />
    </div>
  );
}
