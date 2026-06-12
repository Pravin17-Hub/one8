import fs from 'fs';
import path from 'path';

const logPath = 'C:\\Users\\Dell\\.gemini\\antigravity\\brain\\7a5117f0-e877-40c8-bdb7-1c7a720c2d5e\\.system_generated\\logs\\transcript.jsonl';
const lines = fs.readFileSync(logPath, 'utf8').split('\n');

for (const line of lines) {
  if (!line) continue;
  try {
    const data = JSON.parse(line);
    if (data.type === 'USER_INPUT' && data.content && data.content.includes('"category": "Beauty & Personal Care"')) {
      fs.writeFileSync('c:/Users/Dell/Desktop/One8/backend/beauty_data.json', data.content);
      console.log('Successfully extracted beauty data!');
      process.exit(0);
    }
  } catch (e) {
    // ignore parse errors
  }
}
console.log('Could not find beauty data.');
