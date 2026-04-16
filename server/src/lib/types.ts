// ── Types ─────────────────────────────────────────────────────────────────────

export interface FieldSchema {
     type: string;
     required?: boolean;
     unique?: boolean;
     primary?: boolean;
     values?: string[];
     default?: unknown;
     enum?: string[];
     [key: string]: unknown;
}

export interface RelationSchema {
     type: string;
     target: string;
}

export interface ModelApiSchema {
     enabled?: boolean;
     crud?: boolean;
     methods?: string[];
}

export interface ModelOptionsSchema {
     timestamps?: boolean;
     softDelete?: boolean;
}

export interface ModelSchema {
     table?: string;
     fields: Record<string, FieldSchema>;
     timestamps?: boolean;
     relations?: Record<string, RelationSchema>;
     api?: ModelApiSchema;
     options?: ModelOptionsSchema;
}

export interface FeatureSchema {
     enabled: boolean;
     [key: string]: unknown;
}

export interface AuthFeatureSchema extends FeatureSchema {
     strategy?: string;
     userModel?: string;
}

export interface PaginationConfig {
     enabled?: boolean;
     pageLimit?: number;
}

export interface CrudFeatureSchema extends FeatureSchema {
     pagination?: PaginationConfig;
}

export interface PluginSchema {
     name: string;
     enabled: boolean;
     config?: Record<string, unknown>;
}

export interface SecurityConfig {
     hash?: string;
     jwtSecret?: string;
     cors?: {
          enabled?: boolean;
          origin?: string;
     };
}

export interface AppConfig {
     app: {
          name: string;
          port: number;
     };
     server?: {
          apiPrefix?: string;
     };
     database: {
          type?: string;
          provider?: string;
          url: string;
     };
     api?: {
          prefix?: string;
     };
     models: Record<string, ModelSchema>;
     features: Record<string, FeatureSchema>;
     plugins?: PluginSchema[];
     security?: SecurityConfig;
     output: {
          structure?: string;
          language?: string;
          framework?: string;
          folders?: Record<string, unknown>;
          paths: {
               base: string;
               controllers: string;
               models: string;
               routes: string;
               middleware: string;
               services?: string;
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