# Backend Configuration Guide

Complete guide for writing YAML configuration files to generate custom backend applications.

## Table of Contents

- [Quick Start](#quick-start)
- [Core Configuration](#core-configuration)
- [Models](#models)
- [Features & Plugins](#features--plugins)
- [Output & Security](#output--security)
- [Complete Examples](#complete-examples)

## Quick Start

Create a `config.yaml` file with these required sections:

```yaml
app:
  name: "my-app"
  port: 3000

database:
  provider: "postgresql"
  url: "postgresql://user:pass@localhost:5432/mydb"

models:
  # Your data models here

output:
  paths:
    base: "./generated"
```

## Core Configuration

### App Settings

Define your application's basic information:

```yaml
app:
  name: "my-backend"      # Application name
  port: 3000              # Port number (integer)
```

**Required fields:** `name`, `port`

### Server Configuration

Optional server-level settings:

```yaml
server:
  apiPrefix: "/api/v1"    # API route prefix
```

### Database

Configure your database connection:

```yaml
database:
  provider: "postgresql"   # Database type: postgresql, mysql, sqlite, mongodb
  url: "postgresql://localhost:5432/mydb"  # Connection string
```

**Required fields:** `provider`, `url`

**Supported providers:**
- `postgresql`
- `mysql`
- `sqlite`
- `mongodb`

## Models

Models define your data structures and API endpoints. Each model must start with an uppercase letter.

### Basic Model Structure

```yaml
models:
  User:                   # Model name (must start with uppercase)
    table: "users"        # Optional: database table name
    fields:
      # Field definitions
    api:
      # API configuration
    options:
      # Model options
    relations:
      # Model relationships
```

### Field Definitions

Fields define the schema for your model. Field names must start with a lowercase letter.

```yaml
fields:
  id:
    type: "integer"
    primary: true
    auto: true
  
  email:
    type: "string"
    required: true
    unique: true
  
  username:
    type: "string"
    required: true
  
  role:
    type: "string"
    enum: ["admin", "user", "guest"]
    default: "user"
  
  isActive:
    type: "boolean"
    default: true
```

**Field Properties:**
- `type` (required): Data type - `string`, `integer`, `boolean`, `date`, `text`, `float`, etc.
- `required`: Whether the field is mandatory
- `unique`: Whether values must be unique
- `primary`: Mark as primary key
- `auto`: Auto-increment/auto-generate
- `default`: Default value
- `enum`: Array of allowed values

### API Configuration

Control how your model is exposed via REST API:

```yaml
api:
  enabled: true           # Enable/disable API for this model
  crud: true              # Enable all CRUD operations
  
  # Or specify individual methods:
  methods: ["create", "read", "update", "delete"]
```

**Available methods:** `create`, `read`, `update`, `delete`

### Model Options

```yaml
options:
  timestamps: true        # Add createdAt/updatedAt fields
  softDelete: true        # Enable soft delete (deletedAt field)
```

### Relations

Define relationships between models:

```yaml
relations:
  posts:                  # Relation name
    type: "one-to-many"   # Relationship type
    target: "Post"        # Target model name
    foreignKey: "userId"  # Foreign key field
  
  profile:
    type: "one-to-one"
    target: "Profile"
    foreignKey: "userId"
```

**Relationship Types:**
- `one-to-one`: Single relation (e.g., User has one Profile)
- `one-to-many`: Multiple relations (e.g., User has many Posts)
- `many-to-one`: Inverse of one-to-many (e.g., Post belongs to User)
- `many-to-many`: Multiple on both sides (e.g., Users and Roles)

## Features & Plugins

### Features

Enable optional features like authentication:

```yaml
features:
  auth:
    enabled: true
    strategy: "jwt"       # Authentication strategy
    userModel: "User"     # Model to use for auth

  crud:
    enabled: true
```

## Output & Security

### Output Paths

Configure where generated files will be saved:

```yaml
output:
  paths:
    base: "./generated"
    controllers: "./generated/controllers"
    models: "./generated/models"
    routes: "./generated/routes"
    middleware: "./generated/middleware"
    services: "./generated/services"
```

**Required:** `paths` object with at least `base` defined.

### Security

```yaml
security:
  hash: "bcrypt"          # Password hashing algorithm
  jwtSecret: "your-secret-key-here"
  cors:
    enabled: true
    origin: "*"           # Allowed origins
```

### Environment Variables

Define environment-specific configurations:

```yaml
env:
  development:
    DEBUG: true
    LOG_LEVEL: "debug"
  
  production:
    DEBUG: false
    LOG_LEVEL: "error"
```

## Complete Examples

### Simple Blog API

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
      methods: ["create", "read", "update"]
    
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
      crud: true
    
    options:
      timestamps: true
      softDelete: true
    
    relations:
      author:
        type: "many-to-one"
        target: "User"
        foreignKey: "authorId"

features:
  authentication:
    enabled: true
    strategy: "jwt"
    userModel: "User"

security:
  hash: "bcrypt"
  jwtSecret: "change-this-secret"
  cors:
    enabled: true
    origin: "*"

output:
  paths:
    base: "./src/generated"
    controllers: "./src/generated/controllers"
    models: "./src/generated/models"
    routes: "./src/generated/routes"

naming:
  case: "camelCase"
  fileCase: "kebab-case"
```

### E-commerce API

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
      methods: ["create", "read", "update"]
    
    options:
      timestamps: true
    
    relations:
      user:
        type: "many-to-one"
        target: "User"
        foreignKey: "userId"
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
      enabled: false
    
    relations:
      order:
        type: "many-to-one"
        target: "Order"
        foreignKey: "orderId"
      product:
        type: "many-to-one"
        target: "Product"
        foreignKey: "productId"

output:
  paths:
    base: "./backend"
    controllers: "./backend/controllers"
    models: "./backend/models"
    routes: "./backend/routes"
    services: "./backend/services"
```

## Validation Rules

### Naming Conventions

- **Model names:** Must start with uppercase letter, alphanumeric only (e.g., `User`, `BlogPost`)
- **Field names:** Must start with lowercase letter, alphanumeric only (e.g., `email`, `firstName`)

### Required Sections

Your configuration MUST include:
1. `app` (with `name` and `port`)
2. `database` (with `provider` and `url`)
3. `models` (at least one model with fields)
4. `output` (with `paths` object)

### Best Practices

1. **Use meaningful model names:** Choose clear, singular nouns (e.g., `User` not `Users`)
2. **Always define primary keys:** Each model should have an `id` field marked as primary
3. **Enable timestamps:** Use `timestamps: true` for audit trails
4. **Secure your secrets:** Never commit `jwtSecret` or sensitive data
5. **Define relations properly:** Ensure foreign keys exist in related models
6. **Use enums for fixed options:** Prefer enums over free-form strings
7. **Start simple:** Begin with basic models and add features incrementally

## Troubleshooting

**Model name error:** Ensure model names start with uppercase (e.g., `User` not `user`)

**Field name error:** Field names must start with lowercase (e.g., `email` not `Email`)

**Missing required fields:** Check that `app`, `database`, `models`, and `output` are present

**Invalid relation:** Verify the target model exists and foreign keys are properly defined

**Enum values:** Ensure enum arrays contain only strings

---