const fs = require("fs");
const path = require("path");

function copyHbsFiles(srcDir, destDir, baseDir = srcDir) {
    if (!fs.existsSync(srcDir)) return;

    for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
        const srcPath = path.join(srcDir, entry.name);

        if (entry.isDirectory()) {
            copyHbsFiles(srcPath, destDir, baseDir);
        } else if (entry.name.endsWith(".hbs")) {
            // preserve relative path from baseDir
            const relativePath = path.relative(baseDir, srcPath);
            const destPath = path.join(destDir, relativePath);

            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

const srcRoot = path.join(__dirname, "..", "src");
const destRoot = path.join(__dirname, "..", "dist","src");

copyHbsFiles(srcRoot, destRoot);

console.log("✅ Template files copied successfully.");
