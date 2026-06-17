import fs from 'fs';
const html = fs.readFileSync('index.html', 'utf8');
const matches = html.match(/\/assets\/[^"']+/g);
console.log(`Found ${matches ? matches.length : 0} matches in index.html`);
if (matches) {
  console.log(matches.slice(0, 5));
}
