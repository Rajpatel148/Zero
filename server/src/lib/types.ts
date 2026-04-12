// ── Types ─────────────────────────────────────────────────────────────────────

export interface FieldSchema {
     type: string;
     required?: boolean;
     unique?: boolean;
     primary?: boolean;
     values?: string[];
     default?: unknown;
     [key: string]: unknown;
}

export interface RelationSchema {
     type: string;
     target: string;
}

export interface ModelSchema {
     fields: Record<string, FieldSchema>;
     timestamps?: boolean;
     relations?: Record<string, RelationSchema>;
}

export interface FeatureSchema {
     enabled: boolean;
     [key: string]: unknown;
}

export interface PluginSchema {
     name: string;
     enabled: boolean;
     config?: Record<string, unknown>;
}

export interface AppConfig {
     app: {
          name: string;
          port: number;
     };
     database: {
          type: string;
          url: string;
     };
     api: {
          prefix: string;
     };
     models: Record<string, ModelSchema>;
     features: Record<string, FeatureSchema>;
     plugins: PluginSchema[];
     output: {
          structure: string;
          language: string;
          framework: string;
          folders: Record<string, unknown>;
          paths: {
               base:string;
               controllers: string;
               models: string;
               routes: string;
               middlewares: string;
               services: string;
          };
     };
}

export interface ValidationResult {
     valid: boolean;
     config: AppConfig | null;
     errors: string[];
     summary: string;
}

export interface ValidateOptions {
     strict?: boolean;
}