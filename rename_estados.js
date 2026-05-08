const fs = require('fs');
const path = require('path');

const frontendPath = path.join(__dirname, 'frontend/src');
const backendPath = path.join(__dirname, 'backend/src');

const frontendDirToRename = path.join(frontendPath, 'app/modules/estandarizacion/components/estados');
const frontendNewDir = path.join(frontendPath, 'app/modules/estandarizacion/components/criterios');

const backendDirToRename = path.join(backendPath, 'modules/estandarizacion/estados');
const backendNewDir = path.join(backendPath, 'modules/estandarizacion/criterios');

// 1. Rename directories
if (fs.existsSync(frontendDirToRename)) {
    fs.renameSync(frontendDirToRename, frontendNewDir);
    console.log('✅ Renombrado en frontend:', frontendDirToRename, '->', frontendNewDir);
} else {
    console.log('⚠️ Carpeta frontend no encontrada:', frontendDirToRename);
}

if (fs.existsSync(backendDirToRename)) {
    fs.renameSync(backendDirToRename, backendNewDir);
    console.log('✅ Renombrado en backend:', backendDirToRename, '->', backendNewDir);
} else {
    console.log('⚠️ Carpeta backend no encontrada:', backendDirToRename);
}

// 2. Search and replace in files
function walkSync(dir, callback) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        const stats = fs.statSync(filepath);
        if (stats.isDirectory()) {
            walkSync(filepath, callback);
        } else if (stats.isFile()) {
            callback(filepath);
        }
    }
}

function processFile(filepath) {
    // Only process typical source files
    if (!filepath.endsWith('.ts') && !filepath.endsWith('.html') && !filepath.endsWith('.css') && !filepath.endsWith('.js')) {
        return;
    }

    let content = fs.readFileSync(filepath, 'utf8');
    let originalContent = content;

    // Replace import paths containing /estados/ or ends with /estados
    content = content.replace(/\/estados\//g, '/criterios/');
    content = content.replace(/\/estados'/g, '/criterios\'');
    content = content.replace(/\/estados"/g, '/criterios"');
    
    if (content !== originalContent) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log('📝 Actualizadas las rutas en:', filepath);
    }
}

console.log('Procesando archivos del frontend...');
walkSync(frontendPath, processFile);
console.log('Procesando archivos del backend...');
walkSync(backendPath, processFile);

console.log('🎉 ¡Proceso completado!');
