/**
 * Curated high-resolution culinary photography for dishes and restaurants.
 * Provides fallback imagery when custom restaurant photos haven't been uploaded yet.
 */

export const RESTAURANT_COVERS: Record<string, { cover: string; logo: string; tagline: string; rating: string; reviews: string; prepTime: string; priceRange: string }> = {
  spicegarden: {
    cover: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
    logo: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=200&q=80',
    tagline: 'Authentic Heritage Indian Cuisine & Clay Oven Specialties',
    rating: '4.9',
    reviews: '1,420+',
    prepTime: '25-35 min',
    priceRange: '₹₹₹',
  },
  burgerlab: {
    cover: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1600&q=80',
    logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80',
    tagline: 'Artisanal Smash Burgers, Hand-Cut Loaded Fries & Craft Shakes',
    rating: '4.8',
    reviews: '980+',
    prepTime: '15-25 min',
    priceRange: '₹₹',
  },
  zensushi: {
    cover: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1600&q=80',
    logo: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=200&q=80',
    tagline: 'Premium Tokyo Omakase, Handcrafted Rolls & Japanese Craft Teas',
    rating: '4.95',
    reviews: '2,150+',
    prepTime: '20-30 min',
    priceRange: '₹₹₹₹',
  },
};

const DISH_IMAGE_MAP: Array<{ keywords: string[]; url: string }> = [
  // Indian specialties
  { keywords: ['butter chicken', 'murgh makhani'], url: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['biryani', 'chicken biryani', 'veg biryani'], url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['tikka', 'paneer tikka', 'tandoori chicken'], url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['dal makhani', 'dal'], url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['palak paneer', 'saag'], url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['rogan josh', 'mutton', 'lamb'], url: 'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['kadai', 'kadai chicken'], url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['naan', 'garlic naan', 'roti', 'bread'], url: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['rice', 'jeera rice', 'basmati'], url: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['lassi', 'mango lassi'], url: 'https://images.unsplash.com/photo-1570776703750-7f55b927d3b0?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['chai', 'masala chai', 'tea'], url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['soda', 'lime soda', 'lemonade'], url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80' },

  // Burgers & Western
  { keywords: ['smash burger', 'classic smash', 'beef'], url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['crispy chicken', 'chicken burger'], url: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['bacon', 'bbq bacon'], url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['veggie', 'mushroom', 'plant-based'], url: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['fries', 'loaded', 'sweet potato'], url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['onion rings', 'coleslaw'], url: 'https://images.unsplash.com/photo-1639024471287-032f6983cfb4?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['shake', 'oreo', 'milkshake'], url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['cola', 'drink'], url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80' },

  // Japanese & Asian
  { keywords: ['dragon roll', 'roll', 'california roll', 'sushi roll'], url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['nigiri', 'salmon nigiri', 'tuna'], url: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['sashimi'], url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['ramen', 'noodles'], url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['tempura', 'crispy'], url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['edamame', 'salad'], url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80' },
  { keywords: ['matcha', 'green tea', 'miso'], url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80' },
];

export function getDishImage(dishName: string, categoryName = ''): string {
  const query = `${dishName} ${categoryName}`.toLowerCase();
  for (const item of DISH_IMAGE_MAP) {
    if (item.keywords.some((k) => query.includes(k))) {
      return item.url;
    }
  }
  // Default appetizing dish photo
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80';
}
