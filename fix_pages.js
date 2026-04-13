const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('page.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const appDir = path.resolve(__dirname, 'apps/web/src/app');
const pages = walk(appDir);

pages.forEach(p => {
    const content = fs.readFileSync(p, 'utf8');
    if (content.trim() === '// TODO: implement') {
        const componentName = p.split(path.sep).reverse()[1].replace(/-([a-z])/g, g => g[1].toUpperCase());
        const PascalName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
        
        fs.writeFileSync(p, `'use client';\n\nimport React from 'react';\n\nexport default function ${PascalName}Page() {\n  return (\n    <div className="p-8">\n      <h1 className="text-2xl font-bold">${PascalName} Page</h1>\n      <p className="mt-4 text-gray-600">This page is still under implementation.</p>\n    </div>\n  );\n}\n`);
        console.log(`Fixed: ${p}`);
    }
});
