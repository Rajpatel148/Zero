import { runCommand } from "../cli/cmdRunner.js";
import { tsconfigTemplate } from "../templates/config.template.js";
import { generateFromTemplate } from "../lib/utilityFunctions/codeGeneratorFromTemplate.js";
import { AppConfig, AuthFeatureSchema, CrudFeatureSchema } from "../lib/types.js";
import path from "path";
import { fileURLToPath } from "url";
import { OUTPUT_PATH } from "../engine/index.js";
import { appendFile, writeFile } from "../lib/utilityFunctions/file.helper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type starterGeneratorPrms = {
     config: AppConfig;
}
export const starterGenerator = async ({ config }: starterGeneratorPrms): Promise<boolean> => {
     try {
          //run init cmd 
          runCommand("npm init -y");

          // Check if auth is enabled for package.json generation
          const authFeature = config.features?.auth as AuthFeatureSchema | undefined;
          const authEnabled = authFeature?.enabled === true;

          // Check if pagination is enabled
          const crudFeature = config.features?.crud as CrudFeatureSchema | undefined;
          const paginationEnabled = crudFeature?.pagination?.enabled === true;
          
          let outputPath = path.join(OUTPUT_PATH,"package.json");

          await generateFromTemplate({
               templatePath: path.resolve(__dirname, "../templates/package.json.hbs"),
               outputPath,
               context: { authEnabled },
          });

          

          //for install package
          runCommand("npm i") 
          
          runCommand("npx prisma init");

          //generate tsconfig.json for the project
          writeFile("tsconfig.json", OUTPUT_PATH, tsconfigTemplate());

          // generate the .env file 
          writeFile(".env", OUTPUT_PATH, `PORT=${config.app.port}`);

          //make the index.ts file
          outputPath = path.join(OUTPUT_PATH, "src", "index.ts");
          await generateFromTemplate({
               templatePath: path.resolve(__dirname, "../templates/index.ts.hbs"),
               outputPath,
               context: {
                    PORT: config.app.port,
                    ENABLE_LOGGING: false
               }
          });

          // make the app.ts file 
          outputPath = path.join(OUTPUT_PATH, "src", "app.ts");
          await generateFromTemplate({
               templatePath: path.resolve(__dirname, "../templates/app.ts.hbs"),
               outputPath,
               context:config
          });

          //make prisma Instance file
          outputPath = path.join(OUTPUT_PATH, "src", "utils", "prismaInstance.ts");
          await generateFromTemplate({
               templatePath: path.resolve(__dirname, "../templates/prismaInstance.ts.hbs"),
               outputPath
          });


          //make DB Instance file
          outputPath = path.join(OUTPUT_PATH, "src", "utils", "dbConnection.ts");
          await generateFromTemplate({
               templatePath: path.resolve(__dirname, "../templates/dbConnection.ts.hbs"),
               outputPath
          });

          appendFile(".env", OUTPUT_PATH, `DATABASE_URL=${config.database.url}`)

          // Add JWT_SECRET to .env if auth is enabled
          if (authEnabled) {
               const jwtSecret = config.security?.jwtSecret || "your-super-secret-jwt-key";
               appendFile(".env", OUTPUT_PATH, `JWT_SECRET=${jwtSecret}`);
          }

          //make Prisma Schema file
          outputPath = path.join(OUTPUT_PATH, "prisma", "schema.prisma");
          await generateFromTemplate({
               templatePath: path.resolve(__dirname, "../templates/prisma/schema.ts.hbs"),
               outputPath,
               context: config
          });

          //for prisma generate
          runCommand("npx prisma generate");
          
          // create APIResponse file in utils
          outputPath = path.join(OUTPUT_PATH,"src","utils","apiResponse.ts");
          await generateFromTemplate({
               templatePath: path.resolve(__dirname,"../templates/utils/apiResponse.ts.hbs"),
               outputPath,
               context: { paginationEnabled },
          });

          return true;
     } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          const errorStack = error instanceof Error ? error.stack : '';
          
          console.error("\n❌ Error generating starter code:");
          console.error(`   ${errorMessage}`);
          if (errorStack) {
               console.error(`\n   Stack: ${errorStack}`);
          }
          console.error("\n   Make sure:");
          console.error("   • npm is installed and accessible");
          console.error("   • You have write permissions in the project directory");
          console.error("   • Node.js version is compatible (currently: " + process.version + ")\n");
          
          return false;
     }
}