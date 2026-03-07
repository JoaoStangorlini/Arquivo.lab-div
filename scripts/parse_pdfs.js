const fs = require('fs');
const PDFParser = require('pdf2json');

async function extractTextFromPDF(pdfPath) {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(this, 1);

        pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", pdfData => {
            const rawText = pdfParser.getRawTextContent();
            resolve(rawText);
        });

        pdfParser.loadPDF(pdfPath);
    });
}

async function main() {
    const files = [
        'public/Jupiterweb-bach.pdf',
        'public/Jupiterweb-lic.pdf',
        'public/Jupiterweb-med.pdf'
    ];

    for (const file of files) {
        console.log(`\n\n=== Extracting ${file} ===`);
        try {
            const text = await extractTextFromPDF(file);
            const outPath = file.replace('.pdf', '.txt');
            fs.writeFileSync(outPath, text);
            console.log(`Saved text to ${outPath}. Preview:`);
            console.log(text.substring(0, 1000));
        } catch (err) {
            console.error("Failed to parse", file, err);
        }
    }
}

main();
