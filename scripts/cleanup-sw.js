const fs = require('fs');
const path = require('path');

/**
 * 🧹 Hub de Comunicação Científica - V3.0 GOLDEN MASTER
 * Script de Higiene de Git (Cleanup sw.js)
 * Restaura o placeholder __BUILD_ID__ pós-build.
 */

const swPath = path.join(__dirname, '../public/sw.js');

try {
    if (fs.existsSync(swPath)) {
        let swContent = fs.readFileSync(swPath, 'utf8');
        const buildIdRegex = /const BUILD_ID = '.*';/;
        const placeholder = "const BUILD_ID = '__BUILD_ID__';";

        if (buildIdRegex.test(swContent)) {
            swContent = swContent.replace(buildIdRegex, placeholder);
            fs.writeFileSync(swPath, swContent);
            console.log('✅ [GOLDEN MASTER] sw.js higienizado: Placeholder __BUILD_ID__ restaurado.');
        }
    }
} catch (err) {
    console.error('⚠️ [GOLDEN MASTER] Erro na higienização do sw.js:', err.message);
    // Não sai com Erro 1 pois é apenas cleanup cosmético
}
