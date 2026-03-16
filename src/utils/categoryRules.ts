const categoryKeywords: Record<string, string[]> = {
  'Food & Dining': [
    'zomato', 'swiggy', 'mcdonalds', 'dominos', 'kfc', 'restaurant',
    'hotel', 'cafe', 'dhaba', 'khai', 'khana', 'food', 'pizza',
    'burger', 'biryani', 'chaiwala', 'starbucks', 'subway'
  ],
  'Groceries': [
    'dmart', 'bigbasket', 'blinkit', 'zepto', 'reliance fresh',
    'supermarket', 'kirana', 'grofers', 'instamart', 'jiomart'
  ],
  'Transport': [
    'uber', 'ola', 'rapido', 'irctc', 'metro', 'petrol', 'fuel',
    'parking', 'toll', 'redbus', 'bus', 'auto', 'cab', 'taxi'
  ],
  'Health': [
    'apollo', 'medplus', 'pharma', 'hospital', 'clinic', 'chemist',
    'medicine', 'doctor', 'lab', 'diagnostic', 'netmeds', '1mg',
    'practo', 'health'
  ],
  'Shopping': [
    'amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'meesho',
    'snapdeal', 'tata cliq', 'shopsy', 'reliance digital'
  ],
  'Entertainment': [
    'netflix', 'hotstar', 'spotify', 'prime', 'bookmyshow', 'pvr',
    'inox', 'youtube', 'disney', 'zee5', 'sonyliv', 'jiocinema'
  ],
  'Rent & Utilities': [
    'electricity', 'bescom', 'jio', 'airtel', 'vi', 'rent',
    'broadband', 'gas', 'water', 'bsnl', 'act fibernet', 'tata sky'
  ],
  'Education': [
    'course', 'udemy', 'school', 'college', 'fees', 'coaching',
    'byju', 'unacademy', 'coursera', 'skillshare', 'duolingo'
  ],
  'Travel': [
    'makemytrip', 'goibibo', 'oyo', 'flight', 'hotel booking',
    'cleartrip', 'yatra', 'airbnb', 'booking.com'
  ],
  'Investment': [
    'zerodha', 'groww', 'sip', 'mutual fund', 'lic', 'insurance',
    'nps', 'ppf', 'fd', 'rd', 'kuvera', 'coin', 'upstox'
  ],
  'Family': [
    'school fees', 'gift', 'birthday', 'medical', 'parents',
    'toys', 'kids', 'baby'
  ],
}

export function matchCategory(merchant: string): string | null {
  const lower = merchant.toLowerCase()
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return category
      }
    }
  }
  return null
}