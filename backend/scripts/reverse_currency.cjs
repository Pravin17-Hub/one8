const fs = require('fs');
const path = require('path');

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.cjs')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const newContent = content.replace(/₹/g, '$');
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Reverted currency in: ${fullPath}`);
      }
    }
  }
}

const targetDir = path.join(__dirname, '../src');
processDirectory(targetDir);
console.log('Currency swap reverted!');
