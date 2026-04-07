const fs = require("fs");
const path = require("path");

function copyHbsFiles(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;

  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyHbsFiles(srcPath, destPath);
    } else if (entry.name.endsWith(".hbs")) {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyHbsFiles(
  path.join(__dirname, "..", "src"),
  path.join(__dirname, "..", "dist", "src")
);

console.log("✅ Template files copied successfully.");
