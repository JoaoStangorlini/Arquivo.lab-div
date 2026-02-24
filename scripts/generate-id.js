const fs = require('fs');
const path = require('path');

/**
 * 🛠️ Hub de Comunicação Científica - V3.0 GOLDEN MASTER (V4.0)
 * Script Atômico de Geração de BUILD_ID (Step Zero)
 * Modo: No-Dirty Stream Generation
 */

const swSourcePath = path.join(__dirname, '../public/sw.template.js');
const swDestPath = path.join(__dirname, '../public/sw.js');
const buildEnvPath = path.join(__dirname, '../.env.production.local');

try {
    const buildId = Date.now().toString();

    // 1. Injeção em .env.production.local (Nativo Next.js)
    const envContent = `NEXT_PUBLIC_BUILD_ID=${buildId}\n`;
    fs.writeFileSync(buildEnvPath, envContent);

    // 2. Geração do SW de Produção (No-Dirty)
    if (fs.existsSync(swSourcePath)) {
        let swContent = fs.readFileSync(swSourcePath, 'utf8');
        swContent = swContent.replace('self.__BUILD_ID__', buildId);
        fs.writeFileSync(swDestPath, swContent);
        console.log(`✅ [V3.6] sw.js gerado a partir do template com ID: ${buildId}`);
    }

    if (process.env.NODE_ENV !== 'production') {
        console.log(`✅ [V3.6] BUILD_ID '${buildId}' injetado em .env.production.local.`);
    }
} catch (err) {
    console.error('❌ [V3.6] FALHA NO STEP-ZERO:', err.message);
    process.exit(1);
}
