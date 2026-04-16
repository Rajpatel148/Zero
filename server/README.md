# Zero — Config-Driven Backend Generator

> Write one YAML file. Get a complete, production-ready backend.

**Zero** is a CLI tool that reads a `config.yaml` file you write and automatically generates a full Node.js + Express + TypeScript backend — with models, controllers, routes, services, middleware, authentication, and a Prisma schema — so you never write boilerplate again.

---

## Table of Contents

- [Why Zero?](#why-zero)
- [How It Works](#how-it-works)
- [Installation](#installation)
- [CLI Commands](#cli-commands)
  - [zero init](#zero-init)
  - [zero generate](#zero-generate)
  - [zero run](#zero-run)
  - [zero drop](#zero-drop)
- [Writing config.yaml](#writing-configyaml)
  - [app — Application Settings](#app--application-settings)
  - [server — Server Settings](#server--server-settings)
  - [database — Database Connection](#database--database-connection)
  - [models — Your Data Models](#models--your-data-models)
  - [features — Optional Features](#features--optional-features)
  - [security — Auth & CORS](#security--auth--cors)
  - [output — Where Files Go](#output--where-files-go)
  - [env — Environment Variables](#env--environment-variables)
- [Complete Examples](#complete-examples)
  - [Blog API](#blog-api)
  - [E-commerce API](#e-commerce-api)
- [Naming Rules & Validation](#naming-rules--validation)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Why Zero?

Building a backend from scratch always starts the same way:

1. Set up the project structure
2. Define your database models
3. Write controllers, routes, services
4. Wire up authentication
5. Repeat for every new project

Zero eliminates all of that. You describe **what** your backend should look like in a simple YAML file, and Zero **generates the code** for you.

```
Your config.yaml  →  zero generate  →  Complete backend ready to run
```

---

## How It Works

```
┌──────────────────┐     ┌────────────────┐     ┌──────────────────────┐
│   config.yaml    │────▶│  zero generate │────▶│  Generated Backend   │
│  (you write this)│     │   (CLI tool)   │     │  controllers/        │
└──────────────────┘     └────────────────┘     │  models/             │
                                                 │  routes/             │
                                                 │  services/           │
                                                 │  middleware/         │
                                                 │  schema.prisma       │
                                                 └──────────────────────┘
```

Zero reads your config, validates it, then runs its generator engine to produce all the files. You get a fully structured project that you can run immediately with `zero run`.

---

## Installation

Install globally from npm so the `zero` command is available everywhere:

```bash
npm install -g zero-backend
```

Verify the installation:

```bash
zero --version
```

> **Requirements:** Node.js >= 18

---

## CLI Commands

Zero has four commands. Here is a quick overview:

| Command | What it does |
|---|---|
| `zero init` | Interactively create a `config.yaml` |
| `zero generate` | Generate backend code from a config file |
| `zero run` | Start the generated backend in dev mode |
| `zero drop` | Delete the generated output folder |

---

### `zero init`

The easiest way to get started. This command walks you through an interactive wizard and creates a `config.yaml` file for you.

```bash
zero init
```

The wizard will ask you:
- App name and port
- API prefix (e.g. `/api/v1`)
- Database provider (PostgreSQL, MySQL, MongoDB)
- Database connection URL
- Whether to enable CRUD generation
- Whether to enable pagination and set page limit
- Whether to enable JWT authentication
- Whether to enable CORS

At the end, it writes a ready-to-use `config.yaml` in your current directory.

**Options:**

| Flag | Description | Default |
|---|---|---|
| `-n, --name <filename>` | Name of the config file to create | `config.yaml` |
| `-f, --force` | Overwrite existing config without asking | `false` |

**Examples:**

```bash
# Interactive setup, creates config.yaml
zero init

# Create a differently-named config file
zero init --name my-project.yaml

# Overwrite existing config.yaml without confirmation
zero init --force
```

---

### `zero generate`

Reads your config file, validates it, and generates the complete backend.

```bash
zero generate
```

This is the core command. It:
1. Validates your `config.yaml` against Zero's schema
2. Runs the generator engine
3. Outputs all files into the `server/` folder in your current directory

**Options:**

| Flag | Description | Default |
|---|---|---|
| `-c, --config <path>` | Path to your config file | `config.yaml` |
| `-r, --resume` | Resume from the last successful generation step | `false` |
| `-f, --fresh` | Wipe previous progress and start from scratch | `false` |

**Examples:**

```bash
# Generate using the default config.yaml
zero generate

# Generate using a specific config file
zero generate -c ./configs/my-project.yaml

# If a previous run was interrupted, resume it
zero generate --resume

# Discard previous partial output and regenerate everything
zero generate --fresh
```

> **Note:** `--resume` and `--fresh` are mutually exclusive. If both are set, `--fresh` takes priority.

---

### `zero run`

Starts the generated backend in development mode.

```bash
zero run
```

This command runs `npm run dev` inside the generated `server/` folder. Make sure you have run `zero generate` first.

**Example:**

```bash
# 1. Generate the backend
zero generate -c config.yaml

# 2. Start it in dev mode
zero run
```

---

### `zero drop`

Deletes the generated `server/` output folder and clears generation progress state.

```bash
zero drop
```

Use this when you want to cleanly regenerate from scratch — for example, after significantly changing your `config.yaml`.

**Options:**

| Flag | Description | Default |
|---|---|---|
| `-f, --force` | Delete immediately without a confirmation prompt | `false` |

**Examples:**

```bash
# Drop with confirmation prompt
zero drop

# Drop immediately, no questions asked
zero drop --force
```

---

## Writing `config.yaml`

The config file is the heart of Zero. It is a standard YAML file that describes your entire backend. Below is a section-by-section breakdown of every option.

### Minimal required structure

Your config **must** include these four top-level sections:

```yaml
app:        # Application name and port
database:   # Database connection
models:     # At least one data model
output:     # Where to write generated files
```

---

### `app` — Application Settings

Defines your application's identity.

```yaml
app:
  name: "my-backend"   # Used as the project name
  port: 3000           # Port the server will listen on (integer, 1–65535)
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | ✅ Yes | Application name |
| `port` | integer | ✅ Yes | Port number (1–65535) |

---

### `server` — Server Settings

Optional top-level server configuration.

```yaml
server:
  apiPrefix: "/api/v1"   # All routes will be prefixed with this
```

| Field | Type | Required | Description |
|---|---|---|---|
| `apiPrefix` | string | ❌ No | URL prefix for all generated routes. Must start with `/` |

---

### `database` — Database Connection

Configures your database provider and connection string.

```yaml
database:
  provider: "postgresql"                          # Database type
  url: "postgresql://user:pass@localhost:5432/db" # Connection string
```

| Field | Type | Required | Description |
|---|---|---|---|
| `provider` | string | ✅ Yes | One of: `postgresql`, `mysql`, `sqlite`, `mongodb` |
| `url` | string | ✅ Yes | Full database connection string |

**Provider connection string formats:**

| Provider | Example URL |
|---|---|
| `postgresql` | `postgresql://user:password@localhost:5432/mydb` |
| `mysql` | `mysql://root:password@localhost:3306/mydb` |
| `sqlite` | `file:./dev.db` |
| `mongodb` | `mongodb://localhost:27017/mydb` |

---

### `models` — Your Data Models

This is where you define your data structures. Each model becomes a database table, a Prisma model, and a set of API endpoints.

**Rules:**
- Model names **must start with an uppercase letter** (e.g., `User`, `BlogPost`)
- Field names **must start with a lowercase letter** (e.g., `email`, `firstName`)

```yaml
models:
  ModelName:           # Uppercase first letter
    table: "..."       # Optional: custom database table name
    fields:            # Column/field definitions
      ...
    api:               # API exposure settings
      ...
    options:           # Model-level options
      ...
    relations:         # Relationships to other models
      ...
```

---

#### Fields

Fields define the columns/properties of your model.

```yaml
fields:
  id:
    type: "integer"
    primary: true      # This is the primary key
    auto: true         # Auto-increment

  email:
    type: "string"
    required: true     # Cannot be null/missing
    unique: true       # Must be unique across all rows

  username:
    type: "string"
    required: true

  role:
    type: "string"
    enum: ["admin", "user", "guest"]   # Only these values are allowed
    default: "user"                    # Default value if not provided

  isActive:
    type: "boolean"
    default: true

  bio:
    type: "text"       # Long-form text (no length limit)

  score:
    type: "float"
    default: 0.0

  createdOn:
    type: "date"
```

**Field property reference:**

| Property | Type | Required | Description |
|---|---|---|---|
| `type` | string | ✅ Yes | Data type: `string`, `integer`, `boolean`, `float`, `text`, `date` |
| `required` | boolean | ❌ No | Field cannot be null or missing |
| `unique` | boolean | ❌ No | All values must be unique |
| `primary` | boolean | ❌ No | Marks this as the primary key |
| `auto` | boolean | ❌ No | Auto-increment (integers) or auto-generate (strings/UUIDs) |
| `default` | any | ❌ No | Default value when not provided |
| `enum` | string[] | ❌ No | Restricts values to only this list |

---

#### API Configuration

Controls whether and how the model is accessible via REST API.

```yaml
api:
  enabled: true                                    # Enable/disable API for this model
  crud: true                                       # Shorthand: enable all 4 CRUD endpoints

  # OR specify individual operations:
  methods: ["create", "read", "update", "delete"]
```

| Option | Description |
|---|---|
| `enabled: true` | Generates API routes for this model |
| `crud: true` | Shorthand that enables all four methods |
| `methods: [...]` | Fine-grained control — pick only what you need |

**Available methods:** `create` `read` `update` `delete`

> **Tip:** Use `methods` when you want to expose only part of the CRUD, for example read-only or no-delete endpoints.

---

#### Model Options

```yaml
options:
  timestamps: true    # Automatically adds createdAt and updatedAt fields
  softDelete: true    # Instead of deleting rows, sets a deletedAt timestamp
```

| Option | Description |
|---|---|
| `timestamps` | Adds `createdAt` and `updatedAt` to the model automatically |
| `softDelete` | Adds `deletedAt`; "deleted" records are kept in the database but hidden |

---

#### Relations

Relationships link models to each other. The `foreignKey` must be a field that exists on the appropriate model.

```yaml
relations:
  posts:                    # Name of the relation (used in code)
    type: "one-to-many"     # Relationship type
    target: "Post"          # The other model (must be defined in models)
    foreignKey: "userId"    # The FK field that connects them

  profile:
    type: "one-to-one"
    target: "Profile"
    foreignKey: "userId"
```

**Relationship types:**

| Type | Meaning | Example |
|---|---|---|
| `one-to-one` | One record links to exactly one other | User has one Profile |
| `one-to-many` | One record links to many others | User has many Posts |
| `many-to-one` | Many records link to one | Post belongs to User |
| `many-to-many` | Many on both sides | Users ↔ Roles |

---

### `features` — Optional Features

Enable features like CRUD generation, pagination, and authentication.

```yaml
features:
  crud:
    enabled: true           # Enable CRUD code generation for all models
    pagination:
      enabled: true         # Enable paginated list responses
      pageLimit: 10         # Default page size for list endpoints

  auth:
    enabled: true
    strategy: "jwt"         # Currently supported: "jwt"
    userModel: "User"       # Which model holds the user credentials
```

| Feature | Option | Description |
|---|---|---|
| `crud` | `enabled` | Generates controller/service/route boilerplate for all API-enabled models |
| `crud.pagination` | `enabled` | Enables pagination support on generated read/list endpoints |
| `crud.pagination` | `pageLimit` | Default number of records per page when pagination is enabled |
| `auth` | `enabled` | Adds authentication middleware |
| `auth` | `strategy` | Auth method — only `"jwt"` supported currently |
| `auth` | `userModel` | The model that holds `email` and `password` for login |

---

### `security` — Auth & CORS

Security-related settings for JWT and CORS.

```yaml
security:
  hash: "bcrypt"                    # Algorithm used to hash passwords
  jwtSecret: "${JWT_SECRET}"        # Secret key for signing JWTs (use env var!)
  cors:
    enabled: true
    origin: "*"                     # Allowed CORS origins
```

| Field | Description |
|---|---|
| `hash` | Password hashing algorithm. Currently: `"bcrypt"` |
| `jwtSecret` | JWT signing secret. **Never hardcode this** — use `"${JWT_SECRET}"` to load from environment |
| `cors.enabled` | Whether to allow cross-origin requests |
| `cors.origin` | The allowed origin(s). `"*"` allows any. Use a specific domain in production |

> ⚠️ **Security:** Always use an environment variable placeholder like `"${JWT_SECRET}"` for secrets in your config file. Never commit real secrets to version control.

---

### `output` — Where Files Go

Configures where Zero writes the generated files. All paths are relative to your current working directory.

```yaml
output:
  paths:
    base: "./server"                       # Default: root output folder
    controllers: "./server/controllers"    # Optional: override per-type path
    models: "./server/models"
    routes: "./server/routes"
    middleware: "./server/middleware"
    services: "./server/services"
```
---

### `env` — Environment Variables

Define environment-specific variables that will be set when the backend runs.

```yaml
env:
  development:
    DEBUG: true
    LOG_LEVEL: "debug"

  production:
    DEBUG: false
    LOG_LEVEL: "error"
```

---

## Complete Examples

### Blog API

A full blog system with users, posts, auth, and soft delete.

```yaml
app:
  name: "blog-api"
  port: 3000

server:
  apiPrefix: "/api/v1"

database:
  provider: "postgresql"
  url: "postgresql://localhost:5432/blog"

models:
  User:
    fields:
      id:
        type: "integer"
        primary: true
        auto: true
      email:
        type: "string"
        required: true
        unique: true
      password:
        type: "string"
        required: true
      username:
        type: "string"
        required: true

    api:
      enabled: true
      methods: ["create", "read", "update"]   # No delete — protect user accounts

    options:
      timestamps: true

    relations:
      posts:
        type: "one-to-many"
        target: "Post"
        foreignKey: "authorId"

  Post:
    fields:
      id:
        type: "integer"
        primary: true
        auto: true
      title:
        type: "string"
        required: true
      content:
        type: "text"
        required: true
      status:
        type: "string"
        enum: ["draft", "published", "archived"]
        default: "draft"
      authorId:
        type: "integer"
        required: true

    api:
      enabled: true
      crud: true   # Full CRUD for posts

    options:
      timestamps: true
      softDelete: true   # Don't hard-delete posts — just archive them

    relations:
      author:
        type: "many-to-one"
        target: "User"
        foreignKey: "authorId"

features:
  crud:
    enabled: true
    pagination:
      enabled: true
      pageLimit: 10
  auth:
    enabled: true
    strategy: "jwt"
    userModel: "User"

security:
  hash: "bcrypt"
  jwtSecret: "${JWT_SECRET}"
  cors:
    enabled: true
    origin: "*"

output:
  paths:
    base: "./src/generated"
    controllers: "./src/generated/controllers"
    models: "./src/generated/models"
    routes: "./src/generated/routes"

env:
  development:
    DEBUG: true
    LOG_LEVEL: "debug"
  production:
    DEBUG: false
    LOG_LEVEL: "error"
```

---

### E-commerce API

A product/order system with nested relationships and selective API exposure.

```yaml
app:
  name: "ecommerce-api"
  port: 4000

database:
  provider: "postgresql"
  url: "postgresql://localhost:5432/shop"

models:
  Product:
    fields:
      id:
        type: "integer"
        primary: true
        auto: true
      name:
        type: "string"
        required: true
      description:
        type: "text"
      price:
        type: "float"
        required: true
      stock:
        type: "integer"
        default: 0
      category:
        type: "string"
        enum: ["electronics", "clothing", "books", "food"]

    api:
      enabled: true
      crud: true

    options:
      timestamps: true

  Order:
    fields:
      id:
        type: "integer"
        primary: true
        auto: true
      userId:
        type: "integer"
        required: true
      status:
        type: "string"
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"]
        default: "pending"
      total:
        type: "float"
        required: true

    api:
      enabled: true
      methods: ["create", "read", "update"]   # No delete — keep order history

    options:
      timestamps: true

    relations:
      items:
        type: "one-to-many"
        target: "OrderItem"
        foreignKey: "orderId"

  OrderItem:
    fields:
      id:
        type: "integer"
        primary: true
        auto: true
      orderId:
        type: "integer"
        required: true
      productId:
        type: "integer"
        required: true
      quantity:
        type: "integer"
        required: true
      price:
        type: "float"
        required: true

    api:
      enabled: false   # Internal model — no direct API exposure

    relations:
      order:
        type: "many-to-one"
        target: "Order"
        foreignKey: "orderId"
      product:
        type: "many-to-one"
        target: "Product"
        foreignKey: "productId"

features:
  crud:
    enabled: true
    pagination:
      enabled: true
      pageLimit: 20

output:
  paths:
    base: "./backend"
    controllers: "./backend/controllers"
    models: "./backend/models"
    routes: "./backend/routes"
    services: "./backend/services"
```

---

## Naming Rules & Validation

Zero enforces naming conventions to generate clean, consistent code.

| Thing | Rule | ✅ Valid | ❌ Invalid |
|---|---|---|---|
| Model name | Must start with uppercase | `User`, `BlogPost` | `user`, `blog_post` |
| Field name | Must start with lowercase | `email`, `firstName` | `Email`, `FirstName` |
| Relation target | Must match an existing model name exactly | `"Post"` | `"post"` |

### Required sections checklist

Before running `zero generate`, make sure your config includes all four required sections:

- [ ] `app` with `name` and `port`
- [ ] `database` with `provider` and `url`
- [ ] `models` with at least one model that has `fields`
- [ ] `output` with a `paths.base` value

---

## Best Practices

1. **Use singular model names** — `User` not `Users`, `Post` not `Posts`
2. **Always define a primary key** — every model should have an `id` field with `primary: true` and `auto: true`
3. **Enable timestamps by default** — `timestamps: true` gives you `createdAt`/`updatedAt` for free, which is always useful
4. **Use enums for fixed options** — Instead of allowing any string for a `status` field, use `enum: [...]` to constrain the values
5. **Use environment variable placeholders for secrets** — Write `jwtSecret: "${JWT_SECRET}"` in your config and set the real value in your `.env` file
6. **Selectively expose APIs** — Use `methods: [...]` when you don't need all four CRUD operations. For example, prevent hard-deletes by omitting `"delete"`
7. **Use `api.enabled: false` for internal models** — Junction tables like `OrderItem` usually shouldn't have their own API endpoints
8. **Start simple, build up** — Begin with 2–3 models and verify the generated output before expanding

---

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `Model name must start with uppercase` | You wrote `user:` instead of `User:` | Capitalize the model name |
| `Field name must start with lowercase` | You wrote `Email:` instead of `email:` | Lowercase the field name |
| `Missing required section: app` | One of the four required sections is absent | Add the missing section to your config |
| `Invalid relation target` | The `target` model name doesn't exist in `models:` | Make sure the target model is defined and the name matches exactly |
| `Enum values must be strings` | You used a number in an enum array | Wrap all enum values in quotes |
| `File not found` on `zero generate` | The config path is wrong | Use `-c ./path/to/config.yaml` to specify the correct path |
| `Output folder not found` on `zero run` | `zero generate` hasn't been run yet | Run `zero generate` first |

---

## Typical Workflow

```bash
# 1. Install Zero globally
npm install -g zero-backend

# 2. Create your project folder and navigate into it
mkdir my-project && cd my-project

# 3. Set up your config.yaml interactively
zero init

# 4. (Optional) Edit config.yaml to add more models or tweak settings

# 5. Generate your backend
zero generate -c config.yaml

# 6. Start the dev server
zero run

# 7. If you change your config and want to regenerate cleanly
zero drop --force
zero generate -c config.yaml
```

---

*Built by [RAJ MOVALIYA](https://github.com/Rajpatel148) · [Report Issues](https://github.com/Rajpatel148/Zero/issues) · [MIT License](./LICENSE)*