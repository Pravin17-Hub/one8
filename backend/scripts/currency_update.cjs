const fs = require('fs');
const path = require('path');

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace $ that is NOT followed by { (so we don't break string interpolation `${var}`)
      // Also don't replace if preceded by `\` (e.g. `\$`) just in case, but let's just do a regex
      // Look for $ not followed by {
      // It looks like: /\$(?!\{)/g
      
      const newContent = content.replace(/\$(?!\{)/g, '₹');
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated currency in: ${fullPath}`);
      }
    }
  }
}

const targetDir = path.join(__dirname, '../../src');
processDirectory(targetDir);
console.log('Currency swap complete!');
