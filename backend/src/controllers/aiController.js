import { query } from '../config/db.js';

// Jaro-Winkler String Similarity
function jaroWinkler(s1, s2) {
  let m = 0;
  if (s1.length === 0 || s2.length === 0) return 0;
  if (s1 === s2) return 1;

  let range = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
  let s1Matches = new Array(s1.length).fill(false);
  let s2Matches = new Array(s2.length).fill(false);

  for (let i = 0; i < s1.length; i++) {
    let low = Math.max(0, i - range);
    let high = Math.min(i + range + 1, s2.length);
    for (let j = low; j < high; j++) {
      if (!s2Matches[j] && s1[i] === s2[j]) {
        s1Matches[i] = true;
        s2Matches[j] = true;
        m++;
        break;
      }
    }
  }

  if (m === 0) return 0;

  let k = 0;
  let t = 0;
  for (let i = 0; i < s1.length; i++) {
    if (s1Matches[i]) {
      let j = k;
      while (!s2Matches[j]) j++;
      if (s1[i] !== s2[j]) t++;
      k = j + 1;
    }
  }
  t = t / 2;

  let jaro = (m / s1.length + m / s2.length + (m - t) / m) / 3;

  let p = 0.1;
  let l = 0;
  for (let i = 0; i < Math.min(4, s1.length, s2.length); i++) {
    if (s1[i] === s2[i]) {
      l++;
    } else {
      break;
    }
  }
  return jaro + l * p * (1 - jaro);
}

// Semantic synonym mapping
const synonyms = {
  'shoes': ['sneaker', 'sneakers', 'running', 'nike', 'adidas', 'shoe', 'sports shoes', 'footwear', 'boot', 'boots', 'puma', 'trainer', 'trainers'],
  'shoe': ['sneaker', 'sneakers', 'running', 'nike', 'adidas', 'shoes', 'sports shoes', 'footwear', 'boot', 'boots', 'puma', 'trainer', 'trainers'],
  'sneakers': ['shoes', 'shoe', 'sneaker', 'footwear'],
  'sneaker': ['shoes', 'shoe', 'sneakers', 'footwear'],
  'cricket': ['bat', 'bats', 'kookaburra', 'ball', 'balls', 'wicket', 'pads', 'gloves', 'willow'],
  'bat': ['cricket bat', 'willow', 'kookaburra'],
  'bats': ['cricket bat', 'willow', 'kookaburra'],
  'ball': ['cricket ball', 'leather ball', 'tennis ball'],
  'balls': ['cricket ball', 'leather ball', 'tennis ball'],
  'headphones': ['sony', 'audio', 'wireless', 'headphone', 'earbud', 'earbuds', 'sound', 'anc', 'earphones', 'earphone', 'pods'],
  'headphone': ['sony', 'audio', 'wireless', 'headphones', 'earbud', 'earbuds', 'sound', 'anc', 'earphones', 'earphone', 'pods'],
  'earbuds': ['headphones', 'headphone', 'earbud', 'earphones', 'earphone', 'pods'],
  'earbud': ['headphones', 'headphone', 'earbuds', 'earphones', 'earphone', 'pods'],
  'laptop': ['macbook', 'rtx', 'desktop', 'asus', 'gaming', 'computer', 'notebook', 'laptops'],
  'laptops': ['macbook', 'rtx', 'desktop', 'asus', 'gaming', 'computer', 'notebook', 'laptop'],
  'phone': ['iphone', 'samsung', 'galaxy', 'mobile', 'pixel', 'pro max', 'phones'],
  'phones': ['iphone', 'samsung', 'galaxy', 'mobile', 'pixel', 'pro max', 'phone'],
  'mobile': ['iphone', 'samsung', 'galaxy', 'phone', 'phones', 'pixel', 'pro max'],
  'charger': ['anker', 'powercore', 'power', 'bank', 'adapter', 'charging', 'battery', 'usb', 'chargers'],
  'chargers': ['anker', 'powercore', 'power', 'bank', 'adapter', 'charging', 'battery', 'usb', 'charger'],
  'powerbank': ['anker', 'powercore', 'power bank', 'adapter', 'charging', 'battery', 'usb'],
  'bottle': ['water bottle', 'flask', 'hydration', 'bottles'],
  'bottles': ['water bottle', 'flask', 'hydration', 'bottle'],
  'waterbottle': ['water bottle', 'flask', 'hydration']
};

const stopWords = new Set(['product', 'products', 'item', 'items', 'buy', 'want', 'search', 'show', 'find', 'get', 'recommend', 'me', 'a', 'an', 'the', 'some', 'for', 'with', 'under', 'budget', 'please', 'need', 'needs', 'ask', 'asking']);

function parsePriceConstraint(queryStr) {
  // Normalize "10k" or "10 k" to "10000"
  let normalized = queryStr.replace(/(\d+)\s*k\b/g, (match, p1) => {
    return parseInt(p1) * 1000;
  });

  let maxPrice = null;
  let minPrice = null;

  // Patterns for "under", "below", "less than", "<", "within"
  const underPatterns = [
    /under\s+(\d+)/,
    /below\s+(\d+)/,
    /less\s+than\s+(\d+)/,
    /<\s*(\d+)/,
    /within\s+(\d+)/,
    /budget\s+(\d+)/
  ];

  // Patterns for "above", "over", "greater than", ">"
  const abovePatterns = [
    /above\s+(\d+)/,
    /over\s+(\d+)/,
    /greater\s+than\s+(\d+)/,
    />\s*(\d+)/
  ];

  for (const pattern of underPatterns) {
    const match = normalized.match(pattern);
    if (match) {
      maxPrice = parseFloat(match[1]);
      break;
    }
  }

  for (const pattern of abovePatterns) {
    const match = normalized.match(pattern);
    if (match) {
      minPrice = parseFloat(match[1]);
      break;
    }
  }

  return { minPrice, maxPrice };
}

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    
    // Simulate short delay for realistic AI feel
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Please enter a message.' });
    }
    
    const queryStr = message.trim().toLowerCase();
    
    // Fetch all active products
    const result = await query(`
      SELECT p.*, pi.image_url, c.name as category_name
      FROM products p
      LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
      LEFT JOIN product_categories pc ON pc.product_id = p.id
      LEFT JOIN categories c ON c.id = pc.category_id
      WHERE p.status = 'ACTIVE'
    `);
    
    const products = result.rows;
    
    let textResponse = '';
    let suggestions = [];
 
    // Conversational Intents Lists
    const greetings = ['hi', 'hello', 'hey', 'yo', 'greetings', 'sup', 'howdy'];
    const about = ['what is this', 'about this website', 'what is one8', 'tell me about one8', 'how does it work'];
    const orders = ['order', 'shipping', 'track', 'delivery', 'my orders', 'package'];
    const kohli = ['virat kohli', 'virat', 'kohli', 'ambassador', 'brand ambassador'];
    const auctions = ['auction', 'bid', 'bidding', 'auctions'];
    const groupBuy = ['group buy', 'groupbuy', 'bulk discount', 'group buys'];
    const budgetBuilder = ['budget builder', 'combo', 'knapsack', 'budget combo'];
    const sellerIntents = ['how to sell', 'add product', 'seller', 'become a seller', 'post product', 'sell items', 'sell a product'];
    const paymentIntents = ['payment', 'pay', 'upi', 'card', 'checkout payment', 'how to pay', 'payment method'];

    const matchesWord = (list) => list.some(word => queryStr.includes(word));

    if (matchesWord(greetings)) {
      textResponse = "Hello! I am your One8 AI Shopping Assistant. I'm here to help you discover premium items, find the best deals, and answer any questions you have about our marketplace. What can I do for you today?";
      // Suggest top rating products
      suggestions = [...products]
        .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
        .slice(0, 2);
    } else if (matchesWord(about)) {
      textResponse = "One8 AI is a next-generation smart marketplace. We offer premium curated gear and unique shopping options:\n\n1. **Group Buy**: Join forces with the community to unlock wholesale discounts.\n2. **Live Auctions**: Bid in real-time on exclusive gear.\n3. **Budget Builder**: Let our AI builder assemble the perfect combo under your budget.";
      suggestions = products.slice(0, 2);
    } else if (matchesWord(orders)) {
      textResponse = "You can view your order status, history, and tracking details under your Profile -> Order History section. All items are shipped with express courier partners and typically arrive within 3-5 business days across India.";
    } else if (matchesWord(kohli)) {
      textResponse = "Virat Kohli is the brand ambassador of One8! As an elite athlete, he believes in merging peak performance with smart decision-making. One8 AI matches you with the absolute best fitness and lifestyle gear tailored to your needs.";
      const sports = products.filter(p => p.category_name?.toLowerCase().includes('sport') || p.title.toLowerCase().includes('cricket'));
      suggestions = (sports.length > 0 ? sports : products).slice(0, 2);
    } else if (matchesWord(auctions)) {
      textResponse = "Live Auctions let you compete in real-time with other buyers for premium products. Check out the 'Auctions' page in the sidebar to view active bidding rooms. Please make sure you are signed in to place your bids!";
    } else if (matchesWord(groupBuy)) {
      textResponse = "Group Buys allow multiple shoppers to join forces and unlock bulk discounts! Visit the 'Group Buy' section, choose a product, and click 'Join Group Buy'. Once the target buyer count is hit, everyone gets the discounted price!";
    } else if (matchesWord(budgetBuilder)) {
      textResponse = "Our AI Budget Combo Builder makes shopping for gear effortless. Just set your total spending limit, type in the items you need (comma-separated), and the AI will scan our inventory to construct the highest quality setup under that budget!";
    } else if (matchesWord(sellerIntents)) {
      textResponse = "As a verified Seller on One8, you can easily list and manage your products!\n\n1. Go to the **Seller Dashboard** (accessible via your user profile if you have a Seller account).\n2. Click the **Add Product** button.\n3. Fill in all details including Product Title, Description, Price, Stock Quantity, Category, and primary Image URL.\n4. Click **Save Product** and your item will instantly be visible in the catalog for buyers!";
    } else if (matchesWord(paymentIntents)) {
      textResponse = "We support standard simulated payment methods for checkout:\n\n1. **Credit / Debit Cards**: Enter your card number, expiry date, CVV, and name.\n2. **UPI Payments**: Just enter your valid UPI ID (e.g., username@upi).\n\nWhen you checkout, we simulate secure payment verification stages in real-time to guarantee a premium experience!";
    }

    if (!textResponse) {
      const { minPrice, maxPrice } = parsePriceConstraint(queryStr);
      const queryWords = queryStr.split(/\s+/).filter(w => w.length > 1 && !stopWords.has(w));
      const cleanedQueryStr = queryWords.join(' ');
      const expandedQueryWords = [...queryWords];

      // Expand query words with fuzzy synonym keys
      queryWords.forEach(qw => {
        Object.keys(synonyms).forEach(synKey => {
          if (qw !== synKey && qw.length > 2 && synKey.length > 2) {
            const sim = jaroWinkler(qw, synKey);
            if (sim > 0.90) {
              expandedQueryWords.push(synKey);
            }
          }
        });
      });
      
      // Score products based on matching words, synonyms, and spelling mistakes
      const scoredProducts = products.map(prod => {
        const price = parseFloat(prod.price);
        if (minPrice !== null && price < minPrice) return null;
        if (maxPrice !== null && price > maxPrice) return null;

        let score = 0;
        const titleLower = prod.title.toLowerCase();
        const descLower = (prod.description || '').toLowerCase();
        const catLower = (prod.category_name || '').toLowerCase();
        
        // 1. Direct phrase matches
        if (cleanedQueryStr && titleLower.includes(cleanedQueryStr)) score += 500;
        else if (queryWords.length > 0 && queryWords.every(word => titleLower.includes(word))) score += 300;
        
        if (cleanedQueryStr && descLower.includes(cleanedQueryStr)) score += 100;
        if (cleanedQueryStr && catLower.includes(cleanedQueryStr)) score += 150;
        else if (queryWords.length > 0 && queryWords.some(word => catLower.includes(word))) score += 100;

        // Boost if any query word is matched in description
        queryWords.forEach(qw => {
          if (descLower.includes(qw)) {
            score += 150;
          }
        });
        
        // 2. Synonym expansion
        expandedQueryWords.forEach(word => {
          if (synonyms[word]) {
            synonyms[word].forEach(syn => {
              if (titleLower.includes(syn)) score += 40;
              if (descLower.includes(syn)) score += 15;
              if (catLower.includes(syn)) score += 25;
            });
          }
        });
        
        // 3. Word fuzzy matching
        const titleWords = titleLower.split(/\s+/).filter(w => w.length > 1);
        const descWords = descLower.split(/\s+/).filter(w => w.length > 1);
        
        queryWords.forEach(qw => {
          titleWords.forEach(tw => {
            if (qw === tw) {
              score += 150;
            } else if (qw.length > 2 && tw.length > 2) {
              const sim = jaroWinkler(qw, tw);
              if (sim > 0.90) score += 100 * sim;
            }
          });
          
          descWords.forEach(dw => {
            if (qw === dw) {
              score += 15;
            } else if (qw.length > 2 && dw.length > 2) {
              const sim = jaroWinkler(qw, dw);
              if (sim > 0.90) score += 10 * sim;
            }
          });
        });
        
        prod.search_score = score;
        return prod;
      }).filter(p => p !== null);
      
      // Filter out 0 matches
      const matchedProducts = scoredProducts.filter(p => p.search_score > 0);
      matchedProducts.sort((a, b) => b.search_score - a.search_score);
      
      let budgetText = '';
      if (maxPrice !== null && minPrice !== null) {
        budgetText = ` between ₹${minPrice.toLocaleString()} and ₹${maxPrice.toLocaleString()}`;
      } else if (maxPrice !== null) {
        budgetText = ` under ₹${maxPrice.toLocaleString()}`;
      } else if (minPrice !== null) {
        budgetText = ` above ₹${minPrice.toLocaleString()}`;
      }

      if (matchedProducts.length > 0) {
        const bestProd = matchedProducts[0];
        let priceSuffix = budgetText ? ` that fit your budget${budgetText}` : '';
        textResponse = `I've analyzed our catalog and found some excellent matches${priceSuffix}!\n\nHere are the top options:\n`;
        matchedProducts.slice(0, 3).forEach((prod, index) => {
          textResponse += `${index + 1}. **${prod.title}** - ₹${parseFloat(prod.price).toLocaleString()} (${prod.category_name || 'Premium Gear'})\n`;
        });
        textResponse += `\nI highly recommend starting with the "${bestProd.title}" (₹${parseFloat(bestProd.price).toLocaleString()}). Let me know if you'd like more details or if you want me to search for something else!`;
        suggestions = matchedProducts.slice(0, 3);
      } else {
        // Fallback: recommend trending items
        const trending = [...products]
          .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
          .slice(0, 2);
          
        textResponse = `I couldn't find a direct product match in our catalog for "${message}", but I'd love to help you find something else. Here are some of our highest-rated trending products in the marketplace that you might be interested in:`;
        suggestions = trending;
      }
    }
    
    res.json({
      text: textResponse,
      suggestions: suggestions.map(p => ({
        id: p.id,
        title: p.title,
        price: p.price,
        image_url: p.image_url,
        matchScore: p.ai_match_score || 95
      }))
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'AI Concierge encountered an error.' });
  }
};
