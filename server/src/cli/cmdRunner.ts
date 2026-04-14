import { execSync } from 'child_process';
import { OUTPUT_PATH } from '../engine/index.js';

export const runCommand = (command: string) => {
     try {
          execSync(command, {
               stdio: ['ignore', 'pipe', 'inherit'],
               cwd: OUTPUT_PATH, //  run in user's project
          });
     } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          const errorOutput = error instanceof Error && (error as any).stderr ? (error as any).stderr.toString() : '';
          
          const errorDetails = [
               `❌ Command failed: ${command}`,
               `   📂 Working directory: ${OUTPUT_PATH}`,
               errorOutput ? `   Error output: ${errorOutput}` : '',
               `   Error: ${errorMessage}`
          ].filter(Boolean).join('\n');
          
          console.error(errorDetails);
          
          const err = new Error(`Failed to execute command: ${command}\nReason: ${errorMessage}`);
          Object.assign(err, { originalError: error });
          throw err;
     }
};