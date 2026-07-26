const fs = require('fs');

const code = fs.readFileSync('server.js', 'utf8');
const routes = [];

const routeRegex = /app\.(get|post|put|delete)\(['"]([^'"]+)['"],\s*async\s*\(req,\s*res\)\s*=>\s*\{/g;
let match;
while ((match = routeRegex.exec(code)) !== null) {
  const start = match.index;
  const method = match[1];
  const path = match[2];
  
  let braceCount = 1;
  let end = routeRegex.lastIndex;
  while (braceCount > 0 && end < code.length) {
    if (code[end] === '{') braceCount++;
    if (code[end] === '}') braceCount--;
    end++;
  }
  if (code[end] === ')') end++;
  if (code[end] === ';') end++;
  
  routes.push({
    method,
    path,
    start,
    end,
    code: code.slice(start, end)
  });
}

console.log(JSON.stringify(routes.map(r => ({ method: r.method, path: r.path })), null, 2));

// Generate controller files dynamically
function createRouteModule(name, targetRoutes, imports) {
  let controllerContent = imports + '\n\n';
  let routesContent = `import express from 'express';\nimport * as controller from './${name}.controller.js';\n\nconst router = express.Router();\n\n`;
  
  targetRoutes.forEach((routePath, index) => {
    // Find all matching routes
    const matches = routes.filter(r => r.path === routePath || r.path.startsWith(routePath));
    matches.forEach(r => {
      // Create a sensible function name
      const fnName = r.method + routePath.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_') + '_' + index;
      const fnCode = r.code.replace(/app\.(get|post|put|delete)\(['"][^'"]+['"],\s*async\s*\(req,\s*res\)\s*=>\s*\{/, `export const ${fnName} = async (req, res) => {`).replace(/\}\);$/, '}');
      
      controllerContent += fnCode + '\n\n';
      
      let relativePath = r.path.replace(routePath, '');
      if (relativePath === '') relativePath = '/';
      
      routesContent += `router.${r.method}('${relativePath}', controller.${fnName});\n`;
    });
  });
  
  routesContent += `\nexport default router;\n`;
  
  return { controllerContent, routesContent };
}

// Just output what we found for now to verify
