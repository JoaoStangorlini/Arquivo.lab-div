const fs = require('fs');
const path = require('path');

const filesToClean = [
    '.env.production.local',
    '.env.build',
    '.env.local.bak'
];

filesToClean.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            console.log(`✅ [V3.0] Limpo: ${file}`);
        } catch (err) {
            console.error(`❌ Erro ao limpar ${file}:`, err.message);
        }
    }
});
