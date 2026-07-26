const fs = require('fs');
const path = require('path');

const contextPath = path.join(__dirname, 'src', 'providers', 'AgroContext.jsx');
let content = fs.readFileSync(contextPath, 'utf8');

// Replace the destructuring block to include loginUser and logoutUser
content = content.replace(
  /const \{ currentUser, setCurrentUser, hasPermission, logout \} = useAuth\(\);/,
  'const { currentUser, setCurrentUser, hasPermission, logout, loginUser, logoutUser } = useAuth();'
);

// We need to safely remove the redeclarations of switchClient, hasPermission, loginUser, logoutUser, syncToDatabase
// To avoid regex hell, we can just replace them with empty definitions if they are exported or remove them entirely using regex.

content = content.replace(/const switchClient = \(clientKey\) => \{[\s\S]*?return false;\n  \};\n/g, '');
content = content.replace(/const hasPermission = \(moduleName\) => \{[\s\S]*?return false;\n  \};\n/g, '');
content = content.replace(/const loginUser = async \(\{ email, password \}\) => \{[\s\S]*?return result;\n  \};\n/g, '');
content = content.replace(/const logoutUser = \(\) => \{[\s\S]*?window.location.href = '\/';\n  \};\n/g, '');
content = content.replace(/const syncToDatabase = async \(modelName, action, data, engineOverride = null, connectionDataOverride = null\) => \{[\s\S]*?return \{ success: false, error: error.message \};\n    \}\n  \};\n/g, '');

// Also add loginUser, logoutUser to the value={ ... } at the bottom of AgroContext
content = content.replace(
  /currentUser, setCurrentUser, hasPermission, logout,/g,
  'currentUser, setCurrentUser, hasPermission, logout, loginUser, logoutUser,'
);

fs.writeFileSync(contextPath, content);
console.log("Cleaned AgroContext.");
