import { runCommand } from "../cli/cmdRunner.js";
import { installPackage } from "../cli/packageIntaller.js";
import { dependecyList, devDependecyList } from "../templates/dependency.template.js";
import { tsconfigTemplate } from "../templates/tsconfig.template.js";
import { fileGenerator } from "./File.generator.js";
import { generateFromTemplate } from "../lib/utilityFunctions/codeGeneratorFromTemplate.js";
import path from "path";
import { fileURLToPath } from "url";
import { OUTPUT_PATH } from "../engine/index.js";
import { BASE_PATH } from "../../bin/zero.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type starterGeneratorPrms = {
     projectName: string;
     databaseUrl: string;
     port: number
}
export const starterGenerator = ({ projectName, databaseUrl, port }: starterGeneratorPrms): boolean => {
     try {
          //run init cmd 
          runCommand(`cd ${BASE_PATH}`);
          runCommand("npm init -y");

          //install the dependencies 
          dependecyList.forEach((dependecy) => installPackage(dependecy));

          //install the dev dependencies (TypeScript setup)
          devDependecyList.forEach((devDep) => installPackage(devDep, true));

          //for prisma 
          runCommand("npx prisma init");
          
          //generate tsconfig.json for the project
          fileGenerator("tsconfig.json", OUTPUT_PATH, tsconfigTemplate());

          // generate the .env file 
          fileGenerator(".env",OUTPUT_PATH, `PORT=${port}`);

          //make the index.ts file
          let outputPath = path.join(OUTPUT_PATH, "src", "index.ts");
          generateFromTemplate({
               templatePath : path.resolve(__dirname, "../templates/index.ts.hbs"),
               outputPath,
               context: {
                    PORT: port,
                    ENABLE_LOGGING : false
               }
          }
          );

          // make the app.ts file 
          outputPath = path.join(OUTPUT_PATH,"src","app.ts");
          generateFromTemplate({
               templatePath : path.resolve(__dirname,"../templates/app.ts.hbs"),
               outputPath,
          })

          //make prisma Instance file
          outputPath = path.join(OUTPUT_PATH,"utils","prismaInstance.ts");
          generateFromTemplate({
               templatePath:path.resolve(__dirname,"../templates/prismaInstance.ts.hbs"),
               outputPath
          })


          //make DB Instance file
          outputPath = path.join(OUTPUT_PATH,"utils","dbConnection.ts");
          generateFromTemplate({
               templatePath:path.resolve(__dirname,"../templates/dbConnection.ts.hbs"),
               outputPath
          })

          return true;
     } catch (error) {
          console.error("Error generating starter code : ", error);
          return false;
     }
}