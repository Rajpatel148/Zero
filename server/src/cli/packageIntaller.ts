import { execSync } from 'child_process';
import { BASE_PATH } from '../../bin/zero.js';

export const installPackage = (pkg: string, dev: boolean = false) => {
     try {
          const flag = dev ? "--save-dev" : "";
          console.log(`Installing ${pkg}${dev ? " (dev)" : ""}...`);

          execSync(`npm install ${flag} ${pkg}`, {
               stdio: 'inherit', // shows logs in terminal
               cwd: BASE_PATH, // install in user's project
          });

          console.log(`${pkg} installed successfully!`);
     } catch (error) {
          throw error
     }
};