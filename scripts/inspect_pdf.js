const fs = require('fs');
const pdf = require('pdf-parse');

async function extractText(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    try {
        const data = await pdf(dataBuffer);
        console.log(`\n\n=== TEXT FROM ${filePath} ===\n`);
        console.log(data.text.substring(0, 3000)); // Print first 3000 chars to understand structure
    } catch (err) {
        console.error("Error parsing", filePath, err);
    }
}

extractText('public/Jupiterweb-bach.pdf');
