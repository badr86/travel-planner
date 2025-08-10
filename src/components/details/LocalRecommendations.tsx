import React from 'react';
import { InfoCard } from './InfoCard';

interface LocalRecommendationsProps {
  recommendations?: string[] | null;
  languageTips?: string[] | null;
}

export const LocalRecommendations: React.FC<LocalRecommendationsProps> = ({
  recommendations,
  languageTips,
}) => {
  if (!recommendations && !languageTips) {
    return null;
  }

  return (
    <>
      {/* Local Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <InfoCard title="Local Expert Recommendations" className="bg-gradient-to-r from-orange-50 to-red-50">
          <div className="bg-white rounded-lg p-4 border border-orange-200">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🗺️</span>
              <h3 className="text-lg font-medium text-gray-800">Insider Tips</h3>
            </div>
            <ul className="space-y-3">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-700">
                  <span className="text-orange-500 mt-1 flex-shrink-0">•</span>
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </InfoCard>
      )}

      {/* Language Tips */}
      {languageTips && languageTips.length > 0 && (
        <InfoCard title="Language Tips" className="bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="bg-white rounded-lg p-4 border border-indigo-200">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🗣️</span>
              <h3 className="text-lg font-medium text-gray-800">Essential Phrases</h3>
            </div>
            <ul className="space-y-3">
              {languageTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-700">
                  <span className="text-indigo-500 mt-1 flex-shrink-0">•</span>
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </InfoCard>
      )}
    </>
  );
};
