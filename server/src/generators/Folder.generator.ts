import path from "path";
import fs from "fs"


export const folderGenerator = (folderName: string,
     folderPath: string) : boolean=> {
     try {
          const fullPath = path.join(folderPath, folderName);

          fs.mkdirSync(fullPath, { recursive: true });

          return true;
     } catch (error) {
          console.error('Error creating folder : ', error);
          return false;
     }
}