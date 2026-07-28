# NestJS Prisma Sample

A NestJS REST API demonstrating CRUD operations with **NestJS 11**, **Prisma 6**, and **PostgreSQL**.

## Tech Stack

- [NestJS](https://nestjs.com/) — Progressive Node.js framework
- [Prisma](https://www.prisma.io/) — Next-generation ORM for TypeScript
- [PostgreSQL](https://www.postgresql.org/) — Relational database
- [Swagger](https://swagger.io/) — API documentation

## Features

- RESTful API for blog posts and comments
- User registration and lookup
- Search posts by keyword (case-insensitive)
- Pagination support
- Swagger API documentation at `/api`
- Input validation with `class-validator`
- Rate limiting
- Helmet security headers
- Compression middleware

## Prerequisites

- Node.js 24+
- Docker (for local PostgreSQL)

## Getting Started

```bash
# Install dependencies
npm install

# Start PostgreSQL
docker compose up -d

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed sample data
npx prisma db seed

# Start the development server
npm run start:dev
```

Visit `http://localhost:3000/api` for the Swagger UI.

## API Endpoints

### Posts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/posts` | List posts (search by `?q=keyword`, paginate with `?skip=0&limit=10`) |
| GET | `/posts/:id` | Get a single post with comments |
| POST | `/posts` | Create a new post |
| PUT | `/posts/:id` | Update a post |
| DELETE | `/posts/:id` | Delete a post |
| GET | `/posts/:id/comments` | List comments for a post |
| POST | `/posts/:id/comments` | Add a comment to a post |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/:id` | Get a user (optionally with `?withPosts=true`) |
| POST | `/register` | Register a new user |

## Running Tests

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Docker

Build the production image:

```bash
docker build -t nestjs-prisma-sample .
```

## CI/CD

GitHub Actions workflows automate build, test, Docker image publishing, and documentation deployment.

## License

UNLICENSED
