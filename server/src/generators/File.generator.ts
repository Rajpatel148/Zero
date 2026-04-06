import path from "path";
import fs from "fs"

export const fileGenerator = (fileName: string,
     filePath: string, fileContent: string): boolean => {
     try {
          const fullPath = path.join(filePath, fileName);

          fs.writeFileSync(fullPath, fileContent);

          return true;
     } catch (error) {
          console.error('Error creating file : ', error);
          return false;
     }
}