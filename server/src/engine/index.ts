import path from "path";
import { BASE_PATH } from "../../bin/zero.js";
import { starterGenerator } from "../generators/Starter.generator.js";
import { AppConfig } from "../lib/types.js";
import { folderGenerator } from "../lib/utilityFunctions/folder.helper.js";

export let OUTPUT_PATH : string;

export const zeroEngine = async (config : AppConfig) =>{
     let processFlag = true;
     //create the output folder with name of the project name 
     folderGenerator("server",BASE_PATH);

     OUTPUT_PATH = path.join(BASE_PATH,"server");
        
     //generate the server starting code 
     processFlag = starterGenerator({
          config: config
     })
     
     if (processFlag == false) {
          process.exit(1);
     }

     //connection of database is generate 
     //call the model generator
}