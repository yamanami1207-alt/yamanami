import { readdirSync, statSync } from 'fs';
import { join } from 'path';

function walk(dir) {
  let results = [];
  const list = readdirSync(dir);
  for (const file of list) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (!filePath.includes('node_modules') && !filePath.includes('.git')) {
        results = results.concat(walk(filePath));
      }
    } else {
      if (filePath.endsWith('.jpg') || filePath.endsWith('.png') || filePath.endsWith('.jpeg')) {
        results.push(filePath);
      }
    }
  }
  return results;
}

console.log('Found images:', walk('.'));
