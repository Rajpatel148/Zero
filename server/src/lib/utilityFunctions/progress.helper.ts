import fs from "fs";
import path from "path";
import { BASE_PATH } from "../../../bin/zero.js";

const PROGRESS_FILE = ".zero-progress.json";

export interface ProgressData {
     configHash: string;
     completed: string[];
}

export const loadProgress = (): ProgressData => {
     const filePath = path.join(BASE_PATH, PROGRESS_FILE);
     if (!fs.existsSync(filePath)) {
          return { configHash: "", completed: [] };
     }

     try {
          const data = fs.readFileSync(filePath, "utf-8");
          return JSON.parse(data);
     } catch (error) {
          console.error("⚠️ Failed to load progress file, starting fresh.");
          return { configHash: "", completed: [] };
     }
};

export const saveProgress = (progress: ProgressData) => {
     const filePath = path.join(BASE_PATH, PROGRESS_FILE);
     try {
          fs.writeFileSync(filePath, JSON.stringify(progress, null, 2), "utf-8");
     } catch (error) {
          console.error("⚠️ Failed to save progress file.");
     }
};

export const saveStep = (step: string) => {
     const progress = loadProgress();
     if (!progress.completed.includes(step)) {
          progress.completed.push(step);
          saveProgress(progress);
     }
};

export const isStepCompleted = (step: string): boolean => {
     const progress = loadProgress();
     return progress.completed.includes(step);
};

export const resetProgress = () => {
     const filePath = path.join(BASE_PATH, PROGRESS_FILE);
     if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
     }
};

export const updateConfigHash = (hash: string) => {
     const progress = loadProgress();
     if (progress.configHash !== hash) {
          console.log("🔄 Config change detected. Resetting progress.");
          resetProgress();
          saveProgress({ configHash: hash, completed: [] });
     }
};
