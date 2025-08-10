import React from 'react';
import { InfoCard } from './InfoCard';
import { useFormatters } from './hooks/useFormatters';

interface BudgetCategory {
  category: string;
  amount: number;
  percentage?: number;
  details?: string[];
}

interface Budget {
  total?: number;
  currency?: string;
  breakdown?: BudgetCategory[];
  recommendations?: string[];
  summary?: string;
}

interface BudgetBreakdownProps {
  budget?: Budget | null;
}

const BudgetCategoryCard: React.FC<{ category: BudgetCategory; currency: string }> = ({ 
  category, 
  currency 
}) => {
  const { formatCurrency } = useFormatters();

  const getCategoryIcon = (categoryName: string) => {
    const icons: Record<string, string> = {
      'flights': '✈️',
      'accommodation': '🏨',
      'food': '🍽️',
      'activities': '🎯',
      'transportation': '🚗',
      'shopping': '🛍️',
      'miscellaneous': '💼',
      'emergency': '🚨',
    };
    
    const lowerCategory = categoryName.toLowerCase();
    for (const [key, icon] of Object.entries(icons)) {
      if (lowerCategory.includes(key)) {
        return icon;
      }
    }
    return '💰';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 40) return 'bg-red-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getCategoryIcon(category.category)}</span>
          <h3 className="font-medium text-gray-800 capitalize">{category.category}</h3>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg text-gray-800">
            {formatCurrency(category.amount, currency)}
          </p>
          {category.percentage && (
            <p className="text-sm text-gray-500">{category.percentage}%</p>
          )}
        </div>
      </div>

      {category.percentage && (
        <div className="mb-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getProgressColor(category.percentage)}`}
              style={{ width: `${Math.min(category.percentage, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {category.details && category.details.length > 0 && (
        <div className="space-y-1">
          {category.details.map((detail, index) => (
            <p key={index} className="text-sm text-gray-600 flex items-center gap-1">
              <span className="text-gray-400">•</span>
              {detail}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export const BudgetBreakdown: React.FC<BudgetBreakdownProps> = ({ budget }) => {
  const { formatCurrency } = useFormatters();

  if (!budget) {
    return null;
  }

  const totalSpent = budget.breakdown?.reduce((sum, category) => sum + category.amount, 0) || 0;
  const remainingBudget = (budget.total || 0) - totalSpent;

  return (
    <InfoCard title="Budget Breakdown" className="bg-gradient-to-r from-emerald-50 to-teal-50">
      {/* Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <div className="text-2xl mb-2">💰</div>
          <p className="text-sm text-gray-600 font-medium">Total Budget</p>
          <p className="text-xl font-bold text-gray-800">
            {formatCurrency(budget.total, budget.currency)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <div className="text-2xl mb-2">📊</div>
          <p className="text-sm text-gray-600 font-medium">Allocated</p>
          <p className="text-xl font-bold text-blue-600">
            {formatCurrency(totalSpent, budget.currency)}
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <div className="text-2xl mb-2">
            {remainingBudget >= 0 ? '✅' : '⚠️'}
          </div>
          <p className="text-sm text-gray-600 font-medium">Remaining</p>
          <p className={`text-xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(remainingBudget, budget.currency)}
          </p>
        </div>
      </div>

      {/* Budget Summary Text */}
      {budget.summary && (
        <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📝</span>
            <h3 className="text-lg font-medium text-gray-800">Budget Analysis</h3>
          </div>
          <p className="text-gray-700 leading-relaxed">{budget.summary}</p>
        </div>
      )}

      {/* Category Breakdown */}
      {budget.breakdown && budget.breakdown.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
            <span>📋</span>
            Expense Categories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budget.breakdown.map((category, index) => (
              <BudgetCategoryCard
                key={index}
                category={category}
                currency={budget.currency || 'USD'}
              />
            ))}
          </div>
        </div>
      )}

      {/* Budget Recommendations */}
      {budget.recommendations && budget.recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">💡</span>
            <h3 className="text-lg font-medium text-gray-800">Budget Tips</h3>
          </div>
          <ul className="space-y-2">
            {budget.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700">
                <span className="text-blue-500 mt-1">•</span>
                <span className="leading-relaxed">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </InfoCard>
  );
};
