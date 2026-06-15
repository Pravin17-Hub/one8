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

const checkAndGenGroupBuys = async () => {
  // Auto-complete expired group buy sessions
  await query(`
    UPDATE group_buy_sessions
    SET status = CASE WHEN current_quantity >= target_quantity THEN 'COMPLETED' ELSE 'FAILED' END
    WHERE status = 'ACTIVE' AND expires_at <= CURRENT_TIMESTAMP
  `);

  // Count active group buys
  const activeCountRes = await query(`
    SELECT COUNT(*) FROM group_buy_sessions 
    WHERE status = 'ACTIVE' AND expires_at > CURRENT_TIMESTAMP
  `);
  const activeCount = parseInt(activeCountRes.rows[0].count);

  if (activeCount < 5) {
    const needToGenerate = 5 - activeCount;
    console.log(`Active group buy sessions count is ${activeCount}, generating ${needToGenerate} new ones...`);

    for (let i = 0; i < needToGenerate; i++) {
      // Find a random active product that is not currently in an active group buy
      const productRes = await query(`
        SELECT p.id, p.price, p.title FROM products p
        WHERE p.status = 'ACTIVE'
          AND p.id NOT IN (
            SELECT product_id FROM group_buy_sessions 
            WHERE status = 'ACTIVE' AND expires_at > CURRENT_TIMESTAMP
          )
        ORDER BY RANDOM()
        LIMIT 1
      `);

      if (productRes.rows.length > 0) {
        const prod = productRes.rows[0];
        const discountPrice = Math.round(parseFloat(prod.price) * 0.8); // 20% discount
        const targetQty = Math.floor(Math.random() * 8) + 5; // target between 5 and 12

        // Stagger expiration: 12h, 24h, 48h, 72h
        const hours = [12, 24, 48, 72][Math.floor(Math.random() * 4)];
        const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

        await query(`
          INSERT INTO group_buy_sessions (product_id, target_quantity, current_quantity, discount_price, expires_at, status)
          VALUES ($1, $2, 0, $3, $4, 'ACTIVE')
        `, [prod.id, targetQty, discountPrice, expiresAt]);

        console.log(`Spawned new group buy session for product: ${prod.title} (ends in ${hours} hours)`);
      }
    }
  }
};

export const getActiveSessions = async (req, res) => {
  try {
    await checkAndGenGroupBuys();
    const { search } = req.query;

    const result = await query(`
      SELECT g.id, g.target_quantity, g.current_quantity, g.discount_price, g.expires_at, g.status,
             p.title, p.price as original_price, p.description, p.id as product_id,
             c.name as category_name,
             (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND is_primary = true LIMIT 1) as image_url
      FROM group_buy_sessions g
      JOIN products p ON g.product_id = p.id
      LEFT JOIN product_categories pc ON pc.product_id = p.id
      LEFT JOIN categories c ON c.id = pc.category_id
      WHERE g.status = 'ACTIVE' AND g.expires_at > CURRENT_TIMESTAMP
      ORDER BY g.created_at DESC
    `);
    
    let sessions = result.rows;

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

      sessions = sessions.map(session => {
        const discountPrice = parseFloat(session.discount_price);
        if (minPrice !== null && discountPrice < minPrice) return null;
        if (maxPrice !== null && discountPrice > maxPrice) return null;

        let score = 0;
        const titleLower = session.title.toLowerCase();
        const descLower = (session.description || '').toLowerCase();
        const catLower = (session.category_name || '').toLowerCase();

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

        // 2. Synonym mapping
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

        session.search_score = score;
        return session;
      }).filter(s => s !== null);

      // Filter and sort by score
      sessions = sessions.filter(s => s.search_score > 0);
      sessions.sort((a, b) => b.search_score - a.search_score);
    }
    
    res.json(sessions);
  } catch (error) {
    console.error('Failed to fetch group buys', error);
    res.status(500).json({ error: 'Failed to fetch active group buys' });
  }
};

export const getGroupBuyById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT g.id, g.target_quantity, g.current_quantity, g.discount_price, g.expires_at, g.status,
             p.title, p.price as original_price, p.description, p.id as product_id,
             (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND is_primary = true LIMIT 1) as image_url
      FROM group_buy_sessions g
      JOIN products p ON g.product_id = p.id
      WHERE g.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Group buy not found' });
    }

    const session = result.rows[0];

    // Optionally fetch recent participants if needed
    const participants = await query(`
      SELECT u.first_name, u.last_name, gbp.joined_at
      FROM group_buy_participants gbp
      JOIN users u ON gbp.user_id = u.id
      WHERE gbp.session_id = $1
      ORDER BY gbp.joined_at DESC
      LIMIT 20
    `, [id]);
    
    session.recent_participants = participants.rows;

    // Check if current user joined
    if (req.user) {
       const userJoined = await query('SELECT 1 FROM group_buy_participants WHERE session_id = $1 AND user_id = $2', [id, req.user.id]);
       session.user_joined = userJoined.rows.length > 0;
    }

    res.json(session);
  } catch (error) {
    console.error('Failed to fetch group buy details', error);
    res.status(500).json({ error: 'Failed to fetch group buy details' });
  }
};

export const joinSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // Check if user is suspended
    const userRes = await query('SELECT is_suspended, trust_score FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length > 0 && userRes.rows[0].is_suspended) {
      return res.status(403).json({ error: `Your account is suspended due to low trust score (${userRes.rows[0].trust_score}).` });
    }

    // 1. Check if session exists and is active
    const sessionRes = await query('SELECT * FROM group_buy_sessions WHERE id = $1 AND status = $2 AND expires_at > CURRENT_TIMESTAMP', [sessionId, 'ACTIVE']);
    if (sessionRes.rows.length === 0) return res.status(404).json({ error: 'Session not found or expired' });
    
    const session = sessionRes.rows[0];

    // 2. Check if user already joined
    const participantRes = await query('SELECT * FROM group_buy_participants WHERE session_id = $1 AND user_id = $2', [sessionId, userId]);
    if (participantRes.rows.length > 0) return res.status(400).json({ error: 'You have already joined this group buy' });

    // 3. Add participant
    await query('INSERT INTO group_buy_participants (session_id, user_id) VALUES ($1, $2)', [sessionId, userId]);

    // 4. Increment quantity
    const newQuantity = session.current_quantity + 1;
    let newStatus = 'ACTIVE';
    
    if (newQuantity >= session.target_quantity) {
      newStatus = 'COMPLETED';
      // In a real app, this is where we would trigger charges for all participants
    }

    await query('UPDATE group_buy_sessions SET current_quantity = $1, status = $2 WHERE id = $3', [newQuantity, newStatus, sessionId]);

    res.json({ message: 'Successfully joined group buy!', current_quantity: newQuantity, status: newStatus });
  } catch (error) {
    console.error('Failed to join group buy', error);
    res.status(500).json({ error: 'Failed to join session' });
  }
};

export const createGroupBuy = async (req, res) => {
  try {
    const { product_id, target_quantity, discount_price, expires_at } = req.body;
    if (!product_id || !target_quantity || !discount_price || !expires_at) {
      return res.status(400).json({ error: 'product_id, target_quantity, discount_price, and expires_at are required' });
    }
    const expiresDate = new Date(expires_at);
    if (isNaN(expiresDate.getTime()) || expiresDate <= new Date()) {
      return res.status(400).json({ error: 'expires_at must be a valid future date' });
    }
    const result = await query(
      "INSERT INTO group_buy_sessions (product_id, target_quantity, current_quantity, discount_price, expires_at, status) VALUES ($1, $2, 0, $3, $4, 'ACTIVE') RETURNING *",
      [product_id, target_quantity, discount_price, expiresDate]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Failed to create group buy', error);
    res.status(500).json({ error: 'Failed to create group buy' });
  }
};

export const completeGroupBuy = async (req, res) => {
  try {
    const { id } = req.params;
    const { forceSuccess } = req.body;
    
    const sessionRes = await query("SELECT * FROM group_buy_sessions WHERE id = $1", [id]);
    if (sessionRes.rows.length === 0) {
      return res.status(404).json({ error: 'Group buy session not found' });
    }
    
    const session = sessionRes.rows[0];
    const status = (forceSuccess || parseInt(session.current_quantity) >= parseInt(session.target_quantity)) ? 'COMPLETED' : 'FAILED';
    
    const result = await query(
      "UPDATE group_buy_sessions SET status = $1, expires_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to complete group buy', error);
    res.status(500).json({ error: 'Failed to complete group buy' });
  }
};

