// Test script to debug Budget Agent parsing issues
// This will help us see the raw LLM output and fix the parsing logic

const testBudgetAgent = async () => {
  console.log('🧪 Testing Budget Agent Parsing...');
  
  // Test data
  const testRequest = {
    destination: 'Cairo',
    startDate: new Date('2025-07-21'),
    endDate: new Date('2025-07-28'),
    preferences: {
      budget: 'medium',
      interests: ['history', 'culture', 'food'],
      accommodationType: 'hotel',
      travelStyle: 'cultural'
    }
  };

  try {
    // Test the API endpoint
    const response = await fetch('http://localhost:3000/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRequest)
    });

    console.log('📡 API Response Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ API Response received');
    
    if (result.success) {
      console.log('🎯 Travel Plan Generated Successfully');
      
      // Focus on budget analysis
      if (result.data.budget) {
        console.log('\n💰 BUDGET BREAKDOWN ANALYSIS:');
        console.log('Raw Budget Object:', JSON.stringify(result.data.budget, null, 2));
        
        const budget = result.data.budget;
        const calculatedTotal = budget.accommodation + budget.activities + budget.transportation + budget.food + budget.miscellaneous;
        
        console.log('\n📊 Budget Verification:');
        console.log('- Accommodation:', budget.accommodation);
        console.log('- Activities:', budget.activities);
        console.log('- Transportation:', budget.transportation);
        console.log('- Food:', budget.food);
        console.log('- Miscellaneous:', budget.miscellaneous);
        console.log('- Reported Total:', budget.total);
        console.log('- Calculated Total:', calculatedTotal);
        console.log('- Difference:', Math.abs(budget.total - calculatedTotal));
        
        if (Math.abs(budget.total - calculatedTotal) > 1) {
          console.log('❌ BUDGET MISMATCH DETECTED!');
          console.log('The individual amounts do not sum to the reported total.');
        } else {
          console.log('✅ Budget amounts are consistent.');
        }
      }
      
    } else {
      console.error('❌ Travel Plan Generation Failed:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Test Failed:', error.message);
  }
};

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  // Browser environment - add to window for manual testing
  window.testBudgetAgent = testBudgetAgent;
  console.log('🌐 Test function added to window.testBudgetAgent()');
} else {
  // Node.js environment - run the test
  testBudgetAgent();
}
