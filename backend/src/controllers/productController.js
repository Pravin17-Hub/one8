import { query } from '../config/db.js';

// Jaro-Winkler String Similarity Algorithm for fuzzy search spelling correction
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

export const getProducts = async (req, res) => {
  try {
    const { limit = 20, offset = 0, search, category_id } = req.query;
    
    let sql = `
      SELECT p.*, pi.image_url, c.id as category_id, c.name as category_name
      FROM products p
      LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
      LEFT JOIN product_categories pc ON pc.product_id = p.id
      LEFT JOIN categories c ON c.id = pc.category_id
      WHERE p.status = $1
    `;
    let params = ['ACTIVE'];
    
    if (category_id) {
      sql += ` AND pc.category_id = $2`;
      params.push(category_id);
    }
    
    const result = await query(sql, params);
    let products = result.rows;
    
    if (search && search.trim()) {
      const originalQueryStr = search.trim().toLowerCase();
      const { minPrice, maxPrice } = parsePriceConstraint(originalQueryStr);
      const queryWords = originalQueryStr.split(/\s+/).filter(w => w.length > 1 && !stopWords.has(w));
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
      
      products = products.map(prod => {
        const price = parseFloat(prod.price);
        if (minPrice !== null && price < minPrice) return null;
        if (maxPrice !== null && price > maxPrice) return null;

        let score = 0;
        const titleLower = prod.title.toLowerCase();
        const descLower = (prod.description || '').toLowerCase();
        const catLower = (prod.category_name || '').toLowerCase();
        
        // 1. Direct phrase substring matches
        if (cleanedQueryStr && titleLower.includes(cleanedQueryStr)) score += 500;
        else if (queryWords.length > 0 && queryWords.every(word => titleLower.includes(word))) score += 300;
        
        if (cleanedQueryStr && descLower.includes(cleanedQueryStr)) score += 100;
        if (cleanedQueryStr && catLower.includes(cleanedQueryStr)) score += 150;
        else if (queryWords.length > 0 && queryWords.some(word => catLower.includes(word))) score += 100;
        
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
        
        // 3. Word-by-word fuzzy Jaro-Winkler matching
        const titleWords = titleLower.split(/\s+/).filter(w => w.length > 1);
        const descWords = descLower.split(/\s+/).filter(w => w.length > 1);
        
        queryWords.forEach(qw => {
          titleWords.forEach(tw => {
            if (qw === tw) {
              score += 150;
            } else if (qw.length > 2 && tw.length > 2) {
              const sim = jaroWinkler(qw, tw);
              if (sim > 0.90) {
                score += 100 * sim;
              }
            }
          });
          
          descWords.forEach(dw => {
            if (qw === dw) {
              score += 15;
            } else if (qw.length > 2 && dw.length > 2) {
              const sim = jaroWinkler(qw, dw);
              if (sim > 0.90) {
                score += 10 * sim;
              }
            }
          });
        });
        
        prod.search_score = score;
        return prod;
      }).filter(p => p !== null);
      
      // Filter out products with 0 match score
      products = products.filter(p => p.search_score > 0);
      
      // Sort by search score DESC, then rating DESC
      products.sort((a, b) => b.search_score - a.search_score || parseFloat(b.rating) - parseFloat(a.rating));
    } else {
      // Default order: created_at DESC
      products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    // Apply limit and offset in memory
    const parsedLimit = parseInt(limit);
    const parsedOffset = parseInt(offset);
    const paginatedProducts = products.slice(parsedOffset, parsedOffset + parsedLimit);
    
    res.json(paginatedProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching products' });
  }
};

export const getCategories = async (req, res) => {
  try {
    const result = await query('SELECT * FROM categories ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching categories' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT p.*, pc.category_id 
      FROM products p 
      LEFT JOIN product_categories pc ON p.id = pc.product_id 
      WHERE p.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Fetch images
    const images = await query('SELECT image_url, is_primary FROM product_images WHERE product_id = $1', [id]);
    const product = result.rows[0];
    product.images = images.rows;
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching product' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { title, description, price, stock_quantity, category_id, image_url } = req.body;
    // user must be seller and own a store
    let storeRes = await query('SELECT id FROM stores WHERE owner_id = $1', [req.user.id]);
    
    if (storeRes.rows.length === 0) {
      // Auto-create default store for the seller
      const userRes = await query('SELECT first_name, last_name FROM users WHERE id = $1', [req.user.id]);
      const name = userRes.rows.length > 0 
        ? `${userRes.rows[0].first_name}'s Store` 
        : 'My Store';
      storeRes = await query(
        'INSERT INTO stores (owner_id, name, description) VALUES ($1, $2, $3) RETURNING id',
        [req.user.id, name, 'Welcome to my official store!']
      );
    }
    
    const store_id = storeRes.rows[0].id;

    const result = await query(
      'INSERT INTO products (store_id, title, description, price, stock_quantity) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [store_id, title, description, price, stock_quantity || 0]
    );
    const product = result.rows[0];

    if (category_id) {
      await query('INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2)', [product.id, category_id]);
    }
    if (image_url) {
      await query('INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, true)', [product.id, image_url]);
    }

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating product' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, stock_quantity, status, category_id, image_url } = req.body;

    let storeRes = await query('SELECT id FROM stores WHERE owner_id = $1', [req.user.id]);
    if (storeRes.rows.length === 0) {
      // Auto-create default store for the seller
      const userRes = await query('SELECT first_name, last_name FROM users WHERE id = $1', [req.user.id]);
      const name = userRes.rows.length > 0 
        ? `${userRes.rows[0].first_name}'s Store` 
        : 'My Store';
      storeRes = await query(
        'INSERT INTO stores (owner_id, name, description) VALUES ($1, $2, $3) RETURNING id',
        [req.user.id, name, 'Welcome to my official store!']
      );
    }
    const store_id = storeRes.rows[0].id;

    const result = await query(`
      UPDATE products 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          price = COALESCE($3, price),
          stock_quantity = COALESCE($4, stock_quantity),
          status = COALESCE($5, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6 AND store_id = $7
      RETURNING *
    `, [title, description, price, stock_quantity, status, id, store_id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found or unauthorized' });
    const product = result.rows[0];

    if (category_id) {
      await query('DELETE FROM product_categories WHERE product_id = $1', [id]);
      await query('INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2)', [id, category_id]);
    }

    if (image_url !== undefined) {
      await query('DELETE FROM product_images WHERE product_id = $1', [id]);
      if (image_url) {
        await query('INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, true)', [id, image_url]);
      }
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error updating product' });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const storeRes = await query('SELECT id FROM stores WHERE owner_id = $1', [req.user.id]);
    if (storeRes.rows.length === 0) return res.status(403).json({ error: 'No store found' });

    const result = await query('DELETE FROM products WHERE id = $1 AND store_id = $2 RETURNING id', [id, storeRes.rows[0].id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found or unauthorized' });
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error deleting product' });
  }
};

export const getBudgetCombo = async (req, res) => {
  try {
    const { budget, items } = req.body;
    
    if (!budget || isNaN(budget) || parseFloat(budget) <= 0) {
      return res.status(400).json({ error: 'Please enter a valid budget amount.' });
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Please enter at least one product name.' });
    }
    
    const parsedBudget = parseFloat(budget);
    const cleanedItems = items.map(item => item.trim()).filter(item => item.length > 0);
    
    if (cleanedItems.length === 0) {
      return res.status(400).json({ error: 'Please enter at least one valid product name.' });
    }
    
    // 1. Fetch candidates for each item keyword
    const itemCandidates = [];
    for (const item of cleanedItems) {
      const candidates = await findCandidatesHelper(item);
      itemCandidates.push(candidates);
    }
    
    // 2. Backtracking search for the best combination under the budget
    let bestCombo = [];
    let bestQuality = -1;
    let bestCount = 0;
    let bestPrice = 0;
    
    const search = (itemIdx, currentCombo, currentPrice, currentQuality) => {
      if (currentPrice > parsedBudget) {
        return;
      }
      
      const currentCount = currentCombo.length;
      if (currentCount > bestCount || 
          (currentCount === bestCount && currentQuality > bestQuality) || 
          (currentCount === bestCount && currentQuality === bestQuality && currentPrice < bestPrice)) {
        bestCombo = [...currentCombo];
        bestQuality = currentQuality;
        bestCount = currentCount;
        bestPrice = currentPrice;
      }
      
      if (itemIdx === cleanedItems.length) {
        return;
      }
      
      const candidates = itemCandidates[itemIdx] || [];
      
      // Option A: Try each candidate for this item
      for (const candidate of candidates) {
        const ratingVal = parseFloat(candidate.rating) || 0;
        const matchVal = parseInt(candidate.ai_match_score) || 0;
        const candidateQuality = ratingVal * 10 + matchVal; // combine rating and match score
        
        search(
          itemIdx + 1,
          [...currentCombo, { itemQuery: cleanedItems[itemIdx], product: candidate }],
          currentPrice + parseFloat(candidate.price),
          currentQuality + candidateQuality
        );
      }
      
      // Option B: Skip this item
      search(itemIdx + 1, currentCombo, currentPrice, currentQuality);
    };
    
    search(0, [], 0, 0);
    
    res.json({
      original_items: cleanedItems,
      budget: parsedBudget,
      total_price: bestPrice,
      total_quality: bestQuality,
      matched_count: bestCount,
      combo: bestCombo
    });
  } catch (error) {
    console.error('Failed to generate budget combo', error);
    res.status(500).json({ error: 'Failed to generate budget combo. Please try again.' });
  }
};

const findCandidatesHelper = async (keyword) => {
  if (!keyword || !keyword.trim()) return [];
  
  try {
    const sql = `
      SELECT p.*, pi.image_url, c.name as category_name
      FROM products p
      LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = true
      LEFT JOIN product_categories pc ON pc.product_id = p.id
      LEFT JOIN categories c ON c.id = pc.category_id
      WHERE p.status = 'ACTIVE'
    `;
    const result = await query(sql);
    let products = result.rows;

    const originalQueryStr = keyword.trim().toLowerCase();
    const { minPrice, maxPrice } = parsePriceConstraint(originalQueryStr);
    const queryWords = originalQueryStr.split(/\s+/).filter(w => w.length > 1 && !stopWords.has(w));
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
    
    const scoredProducts = products.map(prod => {
      const price = parseFloat(prod.price);
      if (minPrice !== null && price < minPrice) return null;
      if (maxPrice !== null && price > maxPrice) return null;

      let score = 0;
      const titleLower = prod.title.toLowerCase();
      const descLower = (prod.description || '').toLowerCase();
      const catLower = (prod.category_name || '').toLowerCase();
      
      // 1. Direct phrase substring matches
      if (cleanedQueryStr && titleLower.includes(cleanedQueryStr)) score += 500;
      else if (queryWords.length > 0 && queryWords.every(word => titleLower.includes(word))) score += 300;
      
      if (cleanedQueryStr && descLower.includes(cleanedQueryStr)) score += 100;
      if (cleanedQueryStr && catLower.includes(cleanedQueryStr)) score += 150;
      else if (queryWords.length > 0 && queryWords.some(word => catLower.includes(word))) score += 100;
      
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
      
      // 3. Word-by-word fuzzy Jaro-Winkler matching
      const titleWords = titleLower.split(/\s+/).filter(w => w.length > 1);
      const descWords = descLower.split(/\s+/).filter(w => w.length > 1);
      
      queryWords.forEach(qw => {
        titleWords.forEach(tw => {
          if (qw === tw) {
            score += 150;
          } else if (qw.length > 2 && tw.length > 2) {
            const sim = jaroWinkler(qw, tw);
            if (sim > 0.90) {
              score += 100 * sim;
            }
          }
        });
        
        descWords.forEach(dw => {
          if (qw === dw) {
            score += 15;
          } else if (qw.length > 2 && dw.length > 2) {
            const sim = jaroWinkler(qw, dw);
            if (sim > 0.90) {
              score += 10 * sim;
            }
          }
        });
      });
      
      prod.search_score = score;
      return prod;
    }).filter(p => p !== null);
    
    // Filter out products with 0 match score
    const filtered = scoredProducts.filter(p => p.search_score > 0);
    
    // Sort by search score DESC, then rating DESC
    filtered.sort((a, b) => b.search_score - a.search_score || parseFloat(b.rating) - parseFloat(a.rating));
    
    return filtered.slice(0, 5);
  } catch (error) {
    console.error('findCandidatesHelper error:', error);
    return [];
  }
};
