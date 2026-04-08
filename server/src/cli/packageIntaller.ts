import { runCommand } from './cmdRunner.js';

export const installPackage = (pkg: string, dev: boolean = false) => {
     try {
          const flag = dev ? "--save-dev" : "";
          const devLabel = dev ? " (dev dependency)" : " (production)";
          console.log(`\n📦 Installing: ${pkg}${devLabel}`);
          runCommand(`npm install ${flag} ${pkg}`);
          console.log(`✅ Successfully installed: ${pkg}`);
     } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`❌ Failed to install ${pkg}: ${errorMessage}`);
          throw error;
     }
};