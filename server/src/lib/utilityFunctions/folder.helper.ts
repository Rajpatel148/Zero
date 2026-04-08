import path from "path";
import fs from "fs"


export const folderGenerator = (folderName: string,
     folderPath: string) => {
     try {
          const fullPath = path.join(folderPath, folderName);

          fs.mkdirSync(fullPath, { recursive: true });
     } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          throw new Error(`Failed to create folder at ${path.join(folderPath, folderName)}: ${errorMessage}`);
     }
}