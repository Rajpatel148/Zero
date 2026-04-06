import { runCommand } from "../cli/cmdRunner.js";
import { installPackage } from "../cli/packageIntaller.js";
import { dependecyList, devDependecyList } from "../templates/dependency.template.js";
import { tsconfigTemplate } from "../templates/tsconfig.template.js";
import { fileGenerator } from "./File.generator.js";
import { generateFromTemplate } from "../lib/utilityFunctions/codeGeneratorFromTemplate.js";
import path from "path";
import { OUTPUT_PATH } from "../engine/index.js";

type starterGeneratorPrms = {
     projectName: string;
     databaseUrl: string;
     port: number
}
export const starterGenerator = ({ projectName, databaseUrl, port }: starterGeneratorPrms): boolean => {
     try {
          //run init cmd 
          runCommand("npm init -y");

          //install the dependencies 
          dependecyList.forEach((dependecy) => installPackage(dependecy));

          //install the dev dependencies (TypeScript setup)
          devDependecyList.forEach((devDep) => installPackage(devDep, true));

          //generate tsconfig.json for the project
          fileGenerator("tsconfig.json", OUTPUT_PATH, tsconfigTemplate());

          //make the index.ts file
          const outputPath = path.join(OUTPUT_PATH, "src", "index.ts");
          generateFromTemplate({
               templatePath : "../templates/index.ts.hbs",
               outputPath,
               context: {
                    PORT: port,
                    ENABLE_LOGGING : false
               }
          }
          )
          return true;
     } catch (error) {
          console.error("Error generating starter code : ", error);
          return false;
     }
}