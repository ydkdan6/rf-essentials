const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export interface ProductRecommendationRequest {
  interests: string[];
  minBudget: number;
  maxBudget: number;
  skinType?: string;
  preferredBrands?: string[];
  availableProducts: any[];
}

export const getProductRecommendations = async (request: ProductRecommendationRequest) => {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not configured');
    // Return budget-filtered products as fallback
    return request.availableProducts
      .filter(p => p.price >= request.minBudget && p.price <= request.maxBudget)
      .slice(0, 6);
  }

  // Add timeout to prevent hanging
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), 10000); // 10 second timeout
  });

  const prompt = `
    Based on the following user preferences, recommend the most suitable products from the available list:
    
    User Interests: ${request.interests.join(', ')}
    Budget Range: $${request.minBudget} - $${request.maxBudget}
    Skin Type: ${request.skinType || 'Not specified'}
    Preferred Brands: ${request.preferredBrands?.join(', ') || 'No preference'}
    
    Available Products:
    ${request.availableProducts.map(p => `- ${p.name} ($${p.price}) - ${p.category} - ${p.brand}`).join('\n')}
    
    Please return only the product IDs of the top 6 most suitable products, separated by commas. Consider price range, interests, skin type, and brand preferences.
  `;

  try {
    const fetchPromise = fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

    const data = await response.json();
    const recommendedIds = data.candidates?.[0]?.content?.parts?.[0]?.text
      ?.split(',')
      .map((id: string) => id.trim())
      .filter((id: string) => id) || [];

    // Filter products based on recommendations
    let recommendedProducts = request.availableProducts.filter(p => 
      recommendedIds.includes(p.id) || 
      (p.price >= request.minBudget && p.price <= request.maxBudget)
    );

    return recommendedProducts.slice(0, 6);
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    // Enhanced fallback logic
    return request.availableProducts
      .filter(p => p.price >= request.minBudget && p.price <= request.maxBudget)
      .filter(p => {
        // Try to match interests with product categories or tags
        const productText = `${p.category} ${p.name} ${p.tags?.join(' ') || ''}`.toLowerCase();
        return request.interests.some(interest => 
          productText.includes(interest.toLowerCase())
        );
      })
      .slice(0, 6);
  }
};