// scripts/cleanup-artifacts.js
const fs = require('fs');
const path = require('path');

const pathsToRemove = [
    './artifacts',
    './remediation_plan.md',
    './implementation_plan.md',
    './todo.txt',
    './temp_sql_backups'
];

console.log('🚀 Iniciando Purga Técnica de Artefactos...');

pathsToRemove.forEach((p) => {
    const fullPath = path.resolve(p);
    if (fs.existsSync(fullPath)) {
        if (fs.lstatSync(fullPath).isDirectory()) {
            fs.rmSync(fullPath, { recursive: true, force: true });
        } else {
            fs.unlinkSync(fullPath);
        }
        console.log(`✅ Removido: ${p}`);
    }
});

console.log('✨ Limpeza concluída. Código pronto para Produção.');