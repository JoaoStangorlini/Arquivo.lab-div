const fs = require('fs');

const files = {
    'bacharelado': 'public/Jupiterweb-bach.txt',
    'licenciatura': 'public/Jupiterweb-lic.txt',
    'fisica_medica': 'public/Jupiterweb-med.txt'
};

const allCourses = {};

const courseCodeRegex = /^([A-Z0-9]{7})\s+(.+?)\s+\d+\s+\d+/;

for (const [axis, file] of Object.entries(files)) {
    const text = fs.readFileSync(file, 'utf-8');
    const lines = text.split('\n');
    let currentCategory = 'nao_se_aplica'; // fallback

    for (let line of lines) {
        line = line.trim();

        // Detect sections
        if (line.includes('Disciplinas Obrigatórias')) {
            currentCategory = 'obrigatoria';
            continue;
        } else if (line.includes('Optativas Eletivas') || line.includes('Optativa Eletiva') || line.includes('Optativas')) {
            currentCategory = 'eletiva';
            continue;
        }

        // Try to match a course line
        // Example: 4302111                 Física I                                                                                             4            0           60        0                       0
        const match = line.match(/^([A-Z]{3}\d{4}|\d{7})\s+(.+?)\s+\d+\s+\d+\s+\d+/i);
        if (match) {
            const courseCode = match[1].toUpperCase();
            // clean up title
            let title = match[2].trim().replace(/\s+/, ' ');

            if (!allCourses[courseCode]) {
                allCourses[courseCode] = {
                    course_code: courseCode,
                    title: title,
                    category_map: {
                        bacharelado: 'nao_se_aplica',
                        licenciatura: 'nao_se_aplica',
                        fisica_medica: 'nao_se_aplica'
                    }
                };
            }

            // set for this axis
            allCourses[courseCode].category_map[axis] = currentCategory;

            // update title to shortest version if there are differences just in case
            if (title.length > allCourses[courseCode].title.length && !title.includes('  ')) {
                allCourses[courseCode].title = title;
            }
        }
    }
}

// Write the result
const resultArr = Object.values(allCourses);
fs.writeFileSync('scripts/category_map.json', JSON.stringify(resultArr, null, 2));

console.log(`Extracted ${resultArr.length} unique disciplines!`);
console.log('Sample:');
console.log(JSON.stringify(resultArr.slice(0, 3), null, 2));
