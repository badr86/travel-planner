import React from 'react';
import { useRouter } from 'next/navigation';

interface NavigationButtonsProps {
  onBack?: () => void;
  onPrint?: () => void;
  backText?: string;
  printText?: string;
  className?: string;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onBack,
  onPrint,
  backText = '← Back to Planning',
  printText = 'Print Plan',
  className = '',
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/');
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className={`max-w-4xl mx-auto flex justify-between items-center mt-8 ${className}`}>
      <button
        onClick={handleBack}
        className="text-primary hover:text-blue-700 font-medium transition-colors duration-200 flex items-center gap-2"
      >
        <span>{backText}</span>
      </button>
      <button
        onClick={handlePrint}
        className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors duration-200 flex items-center gap-2"
      >
        <span>🖨️</span>
        <span>{printText}</span>
      </button>
    </div>
  );
};
