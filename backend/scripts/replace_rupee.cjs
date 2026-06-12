const fs = require('fs');
const path = require('path');

const targets = [
  { file: 'src/components/ProductCard.jsx', line: 15 },
  { file: 'src/pages/AuctionDetails.jsx', line: 125 },
  { file: 'src/pages/AuctionDetails.jsx', line: 158 },
  { file: 'src/pages/AuctionDetails.jsx', line: 184 },
  { file: 'src/pages/Auctions.jsx', line: 133 },
  { file: 'src/pages/Auctions.jsx', line: 137 },
  { file: 'src/pages/Cart.jsx', line: 70 },
  { file: 'src/pages/Cart.jsx', line: 92 },
  { file: 'src/pages/Cart.jsx', line: 101 },
  { file: 'src/pages/Checkout.jsx', line: 86 },
  { file: 'src/pages/Checkout.jsx', line: 93 },
  { file: 'src/pages/GroupBuy.jsx', line: 121 },
  { file: 'src/pages/GroupBuy.jsx', line: 125 },
  { file: 'src/pages/GroupBuyDetails.jsx', line: 120 },
  { file: 'src/pages/GroupBuyDetails.jsx', line: 121 },
  { file: 'src/pages/Home.jsx', line: 144 },
  { file: 'src/pages/LocalSellers.jsx', line: 113 },
  { file: 'src/pages/OrderDetails.jsx', line: 116 },
  { file: 'src/pages/OrderDetails.jsx', line: 120 },
  { file: 'src/pages/OrderDetails.jsx', line: 129 },
  { file: 'src/pages/OrderHistory.jsx', line: 48 },
  { file: 'src/pages/ProductDetails.jsx', line: 121 },
  { file: 'src/pages/ProductDetails.jsx', line: 229 },
  { file: 'src/pages/ProductListing.jsx', line: 129 },
  { file: 'src/pages/SellerDashboard.jsx', line: 151 }
];

const workspaceRoot = path.join(__dirname, '../../');

targets.forEach(({ file, line }) => {
  const fullPath = path.join(workspaceRoot, file);
  if (!fs.existsSync(fullPath)) {
    console.error(`File does not exist: ${fullPath}`);
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  const lineIndex = line - 1;
  
  if (lineIndex < 0 || lineIndex >= lines.length) {
    console.error(`Line number ${line} is out of bounds for file ${file}`);
    return;
  }
  
  const originalLine = lines[lineIndex];
  if (!originalLine.includes('$')) {
    console.warn(`Line ${line} in file ${file} does not contain '$'. Content: "${originalLine.trim()}"`);
    return;
  }
  
  // Replace the first $ in the line (or all, but let's replace all currency $ on the line)
  // For the case: ${item.price_at_time.toFixed(2)} × {item.quantity}
  // The first $ is the currency symbol.
  // We can replace '$' with '₹' by replacing it.
  const newLine = originalLine.replace('$', '₹');
  lines[lineIndex] = newLine;
  
  fs.writeFileSync(fullPath, lines.join('\n'), 'utf8');
  console.log(`Successfully updated ${file}:${line}`);
});

console.log('Currency updates complete.');
