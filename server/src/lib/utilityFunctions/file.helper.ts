import path from "path";
import fs from "fs";

/**
 * Ensure directory exists
 */
const ensureDir = (dirPath: string) => {
     if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
     }
};

/**
 * Write (create/overwrite) file
 */
export const writeFile = (
     fileName: string,
     filePath: string,
     fileContent: string
) => {
     try {
          ensureDir(filePath);

          const fullPath = path.join(filePath, fileName);
          fs.writeFileSync(fullPath, fileContent, "utf-8");

     } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          throw new Error(`Failed to write file ${path.join(filePath, fileName)}: ${errorMessage}`);
     }
};

/**
 * Append data to file
 */
export const appendFile = (
     fileName: string,
     filePath: string,
     content: string
) => {
     try {
          ensureDir(filePath);

          const fullPath = path.join(filePath, fileName);
          fs.appendFileSync(fullPath, "\n" + content, "utf-8")
     } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          throw new Error(`Failed to append to file ${path.join(filePath, fileName)}: ${errorMessage}`);
     }
};

/**
 * Delete file
 */
export const deleteFile = (
     fileName: string,
     filePath: string
) => {
     try {
          const fullPath = path.join(filePath, fileName);

          if (fs.existsSync(fullPath)) {
               fs.unlinkSync(fullPath);
               return true;
          }

          console.warn("File not found:", fullPath);
     } catch (error) {
          throw Error(`Error on deleting file : ${error}`);
     }
};

/**
 * Read file (bonus)
 */
export const readFile = (
     fileName: string,
     filePath: string
): string | null => {
     try {
          const fullPath = path.join(filePath, fileName);

          if (!fs.existsSync(fullPath)) return null;

          return fs.readFileSync(fullPath, "utf-8");
     } catch (error) {
          throw Error(`Error on reading file : ${error}`);
     }
};