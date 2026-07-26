const fs = require('fs');
const path = require('path');

function replaceRelativeImports(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('dist')) {
        replaceRelativeImports(fullPath);
      }
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const importRegex = /from\s+['"](\.\.?\/[^'"]+)['"]/g;
      const dynamicImportRegex = /import\(['"](\.\.?\/[^'"]+)['"]\)/g;

      let changed = false;

      function replaceFn(match, p1) {
        const resolvedPath = path.resolve(path.dirname(fullPath), p1);
        const srcPath = path.resolve(__dirname, 'src');
        
        if (resolvedPath.startsWith(srcPath)) {
          const relativeToSrc = path.relative(srcPath, resolvedPath).replace(/\\/g, '/');
          changed = true;
          return match.replace(p1, '@/' + relativeToSrc);
        }
        return match;
      }

      content = content.replace(importRegex, replaceFn);
      content = content.replace(dynamicImportRegex, replaceFn);

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated imports in', fullPath);
      }
    }
  }
}

replaceRelativeImports(path.join(__dirname, 'src'));
console.log('Done replacing relative imports with aliases.');
