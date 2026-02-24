const fs = require('fs');
const path = require('path');

const chunkFile = path.join(process.cwd(), '.next', 'static', 'chunks', '5ad34002f11fdf21.js');

if (!fs.existsSync(chunkFile)) {
    console.log('File not found');
    process.exit(1);
}

const content = fs.readFileSync(chunkFile, 'utf8');
const regex = /console\.[a-z]+/g;
let match;
let found = false;

while ((match = regex.exec(content)) !== null) {
    found = true;
    const index = match.index;
    console.log(`\nMatch: ${match[0]} at ${index}`);
    console.log('Context:', content.substring(Math.max(0, index - 50), index + 100));
}

if (!found) {
    console.log('Not found in this file');
}
