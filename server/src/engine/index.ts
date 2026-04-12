import path from "path";
import { BASE_PATH } from "../../bin/zero.js";
import { starterGenerator } from "../generators/Starter.generator.js";
import { AppConfig } from "../lib/types.js";
import { folderGenerator } from "../lib/utilityFunctions/folder.helper.js";
import { crudGenerator } from "../generators/CRUD.generator.js";

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
     
     if (!processFlag) throw new Error("Something failed");
 
     // Crud Generator 
     if (config.features.crud.enabled == true){
          //call CRud generator 
          processFlag = crudGenerator(config);

          if (!processFlag) throw new Error("Something failed");
     }
}