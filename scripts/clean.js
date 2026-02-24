const fs = require('fs');
const path = require('path');

const filesToClean = [
    '.env.production.local',
    '.env.build',
    '.env.local.bak',
    'public/sw.js' // 🧹 Atômico: Limpeza do SW gerado (Template preservado)
];

filesToClean.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            console.log(`🧹 Limpo: ${file}`);
        } catch (err) {
            console.error(`❌ Erro ao limpar ${file}:`, err.message);
        }
    }
});
