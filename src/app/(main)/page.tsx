'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import WorldviewSection from '@/components/WorldviewSection';
import DictionarySection from '@/components/DictionarySection';
import GenerateSection from '@/components/GenerateSection';
import PredictionSection from '@/components/PredictionSection';

function HomeContent() {
  const searchParams = useSearchParams();
  const section = searchParams.get('section') || 'worldview';

  const renderSection = () => {
    switch (section) {
      case 'dictionary':
        return <DictionarySection />;
      case 'generate':
        return <GenerateSection />;
      case 'prediction':
        return <PredictionSection />;
      default:
        return <WorldviewSection />;
    }
  };

  return <>{renderSection()}</>;
}

export default function Home() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-text-muted">加载中...</div>}>
      <HomeContent />
    </Suspense>
  );
}
