import { execSync } from 'child_process';
import { BASE_PATH } from '../../bin/zero.js';

export const runCommand = (command: string) => {
     try {
          execSync(command, {
               stdio: 'inherit', // shows output in terminal
               cwd: BASE_PATH, //  run in user's project
          });
     } catch (error) {
          throw error
     }
};