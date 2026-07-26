const fs = require('fs');
const path = require('path');

function replaceImports(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceImports(fullPath);
    } else if (fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const importRegex = /['"]@\/([^'"]+)['"]/g;
      let changed = false;

      content = content.replace(importRegex, (match, p1) => {
        changed = true;
        const targetPath = path.resolve(__dirname, 'src', p1);
        let relative = path.relative(path.dirname(fullPath), targetPath).replace(/\\/g, '/');
        if (!relative.startsWith('.')) relative = './' + relative;
        return "'" + relative + "'";
      });

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed imports in', fullPath);
      }
    }
  }
}

replaceImports(path.join(__dirname, 'src/backend'));
