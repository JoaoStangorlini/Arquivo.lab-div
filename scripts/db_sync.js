const fs = require('fs');
const crypto = require('crypto');

function generateUUID() {
    return crypto.randomUUID();
}

function camelCase(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

// Read DB state
const rawOut = fs.readFileSync('C:/Users/Stangorlini/.gemini/antigravity/brain/6b45e1d7-d1cd-437a-8e5a-73878bdd392c/.system_generated/steps/459/output.txt', 'utf8');
const dbOutObj = JSON.parse(rawOut);
const dbOutStr = dbOutObj.result;
const jsonStr = dbOutStr.substring(dbOutStr.indexOf('['), dbOutStr.lastIndexOf(']') + 1);
const dbData = JSON.parse(jsonStr);
const dbMap = {}; // courseCode -> id
for (const row of dbData) {
    dbMap[row.course_code.toUpperCase()] = row.id;
}

// Read extracted map from PDF
const extractedJson = JSON.parse(fs.readFileSync('scripts/category_map.json', 'utf8'));

const toInsert = [];
const toUpdate = [];

for (const item of extractedJson) {
    if (dbMap[item.course_code]) {
        // Exists in DB -> Update
        toUpdate.push({
            id: dbMap[item.course_code],
            course_code: item.course_code,
            category_map: item.category_map
        });
    } else {
        // Missing! Need to INSERT
        item.id = generateUUID();
        toInsert.push(item);
    }
}

console.log(`Found ${toInsert.length} disciplines to INSERT (missing from DB).`);
console.log(`Found ${toUpdate.length} disciplines to UPDATE (already in DB).`);

// Generate missing inserts
let sqlInsert = `-- Migrations: seed missing disciplines\n\n`;
for (const item of toInsert) {
    const titleEscaped = item.title.replace(/'/g, "''").trim();
    // Default values for missing properties
    const axis = 'comum';
    const category = 'eletiva'; // Must be from enum: obrigatoria, eletiva, livre
    const jsonStr = JSON.stringify(item.category_map).replace(/'/g, "''");

    // Check if table has category_map already (we'll add it in schema update).
    sqlInsert += `INSERT INTO learning_trails (id, title, course_code, axis, category, category_map, excitation_level, credits_aula)
    VALUES ('${item.id}', '${titleEscaped}', '${item.course_code}', '${axis}', '${category}', '${jsonStr}'::jsonb, 1, 4);\n`;
}
fs.writeFileSync('supabase/migrations/newsqls/20260307000001_seed_missing_disciplines.sql', sqlInsert);

// Generate updates
let sqlUpdate = `-- Migrations: update category map for existing\n\n`;
// Adding schema update in here as well or as a separate file
let schemaUpdate = `-- Migration: Add category_map column\n`;
schemaUpdate += `ALTER TABLE learning_trails ADD COLUMN IF NOT EXISTS category_map JSONB DEFAULT '{"bacharelado":"nao_se_aplica","licenciatura":"nao_se_aplica","fisica_medica":"nao_se_aplica"}'::jsonb;\n`;
fs.writeFileSync('supabase/migrations/newsqls/20260307000000_update_schema.sql', schemaUpdate);

for (const item of toUpdate) {
    const jsonStr = JSON.stringify(item.category_map).replace(/'/g, "''");
    sqlUpdate += `UPDATE learning_trails SET category_map = '${jsonStr}'::jsonb WHERE id = '${item.id}';\n`;
}
fs.writeFileSync('supabase/migrations/newsqls/20260307000002_update_category_map.sql', sqlUpdate);

console.log("Generated migration files!");
