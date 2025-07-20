// Test script to verify Itinerary Agent functionality
// This script will help diagnose issues with the Itinerary Agent

const testItineraryAgent = async () => {
  console.log('🧪 Testing Itinerary Agent...');
  
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
      console.log('📋 Plan Details:');
      console.log('- Destination:', result.data.destination);
      console.log('- Start Date:', result.data.startDate);
      console.log('- End Date:', result.data.endDate);
      console.log('- Itinerary Days:', result.data.itinerary?.length || 0);
      console.log('- Budget Total:', result.data.budget?.total || 0);
      console.log('- General Tips:', result.data.generalTips?.length || 0);
      console.log('- Local Recommendations:', result.data.localRecommendations?.length || 0);
      
      // Check itinerary structure
      if (result.data.itinerary && result.data.itinerary.length > 0) {
        console.log('\n📅 Itinerary Analysis:');
        result.data.itinerary.forEach((day, index) => {
          console.log(`Day ${index + 1}:`, {
            date: day.date,
            activitiesCount: day.activities?.length || 0,
            activities: day.activities?.map(a => a.name) || []
          });
        });
      }
      
      // Check budget structure
      if (result.data.budget) {
        console.log('\n💰 Budget Analysis:');
        console.log('- Accommodation:', result.data.budget.accommodation);
        console.log('- Activities:', result.data.budget.activities);
        console.log('- Transportation:', result.data.budget.transportation);
        console.log('- Food:', result.data.budget.food);
        console.log('- Miscellaneous:', result.data.budget.miscellaneous);
        console.log('- Total:', result.data.budget.total);
        console.log('- Currency:', result.data.budget.currency);
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
  window.testItineraryAgent = testItineraryAgent;
  console.log('🌐 Test function added to window.testItineraryAgent()');
} else {
  // Node.js environment - run the test
  testItineraryAgent();
}
