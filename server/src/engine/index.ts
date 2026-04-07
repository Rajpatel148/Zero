import path from "path";
import { BASE_PATH } from "../../bin/zero.js";
import { folderGenerator } from "../generators/Folder.generator.js";
import { starterGenerator } from "../generators/Starter.generator.js";
import { AppConfig } from "../lib/types.js";

export let OUTPUT_PATH : string;
export const zeroEngine = async (config : AppConfig) =>{
     let processFlag = true;
     //create the output folder with name of the project name 
     processFlag = folderGenerator("server",BASE_PATH);
     OUTPUT_PATH = path.join(BASE_PATH,"server");

     if(processFlag == false){
          process.exit(1);
     }  
        
     //generate the server starting code 
     processFlag = starterGenerator({
          projectName:config.app.name,
          databaseUrl:config.database.url,
          port:config.app.port,
     })
     
     if (processFlag == false) {
          process.exit(1);
     }

     //connection of database is generate 
     //call the model generator
}