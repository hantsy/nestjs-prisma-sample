# Reimplementing a NestJS Blog API: From Mongoose/MongoDB to Prisma/PostgreSQL

> A migration journey from a legacy NestJS + Mongoose + MongoDB REST API to a modern NestJS + Prisma + PostgreSQL stack.

## Background

The original project ([nestjs-sample](https://github.com/hantsy/nestjs-sample)) was a NestJS REST API using Mongoose ODM with MongoDB. While it worked well, several factors motivated a reimplementation:

1. **PostgreSQL preference** — Many teams prefer PostgreSQL for its ACID compliance, rich indexing, and ecosystem maturity.
2. **Prisma's type safety** — Prisma generates fully typed database clients, eliminating the impedance mismatch between TypeScript types and database schemas.
3. **Simplified architecture** — Removing JWT authentication kept the focus on the core REST API patterns.
4. **Modern tooling** — Upgrading to the latest NestJS 11, TypeScript 5.7+, and Prisma 6.x.

## Architecture Overview

```
nestjs-prisma-sample/
├── prisma/
│   ├── schema.prisma          # Data model (User, Post, Comment)
│   └── seed.ts                # Database seeding script
├── src/
│   ├── main.ts                # Bootstrap with Swagger, ValidationPipe, helmet, compression
│   ├── app.module.ts          # Root module: Config, Throttler, Prisma, Post, User
│   ├── app.controller.ts      # Root endpoint
│   ├── app.service.ts         # Root service with built-in Logger
│   ├── config/
│   │   └── validation.ts      # Joi-based env validation (DATABASE_URL, PORT, NODE_ENV)
│   ├── prisma/
│   │   ├── prisma.module.ts   # Global Prisma module
│   │   └── prisma.service.ts  # PrismaClient wrapper with lifecycle hooks
│   ├── post/
│   │   ├── post.module.ts
│   │   ├── post.controller.ts # REST endpoints for posts & comments
│   │   ├── post.service.ts    # Business logic with Prisma queries
│   │   ├── post-data-initializer.service.ts
│   │   └── dto/               # create-post.dto, update-post.dto, create-comment.dto
│   ├── user/
│   │   ├── user.module.ts
│   │   ├── user.controller.ts # User lookup endpoint
│   │   ├── register.controller.ts # User registration endpoint
│   │   ├── user.service.ts
│   │   ├── user-data-initializer.service.ts
│   │   └── dto/               # register.dto, user.dto
│   └── shared/
│       └── enum/
│           └── role-type.enum.ts
├── Dockerfile                 # Multi-stage build with Prisma generate
├── docker-compose.yml         # PostgreSQL 17 for development
└── .github/workflows/         # CI/CD pipelines (build, e2e, dockerize, mkdocs)
```

## Key Design Decisions

### 1. Native Promises vs RxJS Observables

The original project used RxJS Observables extensively, wrapping Mongoose promises. Since Prisma returns native promises, we switched to `async/await` throughout. This simplifies the code and reduces mental overhead:

**Before (RxJS + Mongoose):**
```typescript
findById(id: string): Observable<Post> {
  return from(this.postModel.findOne({ _id: id }).exec()).pipe(
    mergeMap((p) => (p ? of(p) : EMPTY)),
    throwIfEmpty(() => new NotFoundException(`post:${id} was not found`)),
  );
}
```

**After (async/await + Prisma):**
```typescript
async findById(id: string) {
  const post = await this.prisma.post.findUnique({ where: { id } });
  if (!post) {
    throw new NotFoundException(`post:${id} was not found`);
  }
  return post;
}
```

### 2. UUIDs vs MongoDB ObjectIds

Prisma with PostgreSQL uses UUID strings as primary keys, eliminating the need for `ParseObjectIdPipe`:

| Mongoose | Prisma |
|----------|--------|
| `@Param('id', ParseObjectIdPipe) id: string` | `@Param('id') id: string` |
| `new Types.ObjectId(id)` | Plain string UUID |
| `post._id` | `post.id` |

### 3. Built-in Logger

The original project had a custom `LoggerModule` with decorator-based prefix injection. We replaced it with NestJS's built-in `Logger`:

```typescript
// Before: custom LoggerModule
constructor(@Logger('AppService') private readonly logger: LoggerService) {}

// After: NestJS built-in Logger
private readonly logger = new Logger(AppService.name);
```

### 4. No Authentication

The original project used JWT + Passport for authentication with guards on write endpoints. This reimplementation removes all auth code, making all endpoints publicly accessible. Authentication can be added back as a separate concern.

### 5. PrismaService as Global Module

The `PrismaModule` is decorated with `@Global()`, making `PrismaService` available in all modules without explicit imports:

```typescript
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

## Query Pattern Comparison

| Operation | Mongoose | Prisma |
|-----------|----------|--------|
| Find all | `postModel.find({}).skip(skip).limit(limit).exec()` | `prisma.post.findMany({ skip, take: limit })` |
| Find by id | `postModel.findOne({ _id: id }).exec()` | `prisma.post.findUnique({ where: { id } })` |
| Search | `postModel.find({ title: { $regex: '.*' + keyword + '.*' } })` | `prisma.post.findMany({ where: { title: { contains: keyword, mode: 'insensitive' } } })` |
| Create | `postModel.create({ ...data })` | `prisma.post.create({ data })` |
| Update | `postModel.findOneAndUpdate({ _id: id }, data)` | `prisma.post.update({ where: { id }, data })` |
| Delete | `postModel.findOneAndDelete({ _id: id })` | `prisma.post.delete({ where: { id } })` |
| Relations | `userQuery.populate('posts')` | `prisma.user.findUnique({ include: { posts: true } })` |
| Count | Implicit via model | `prisma.post.count({ where: ... })` |

## Docker Setup for Development

The `docker-compose.yml` provides a PostgreSQL 17 instance:

```bash
# Start PostgreSQL
docker compose up -d

# Run migrations
npx prisma migrate dev --name init

# Seed data
npx prisma db seed

# Start dev server
npm run start:dev
```

Access the Swagger UI at `http://localhost:3000/api`.

## CI/CD Pipeline

The project includes GitHub Actions workflows:

- **build.yml** — Runs on push/PR to master. Installs deps, generates Prisma client, runs tests with coverage, uploads to Codecov.
- **e2e.yml** — Spins up PostgreSQL via Docker Compose, runs Prisma migrations, seeds data, and executes E2E tests.
- **dockerize.yml** — Builds and pushes Docker image, deploys to a kind Kubernetes cluster for smoke testing.
- **mkdocs.yml** — Deploys documentation to GitHub Pages.
- **stale.yml** — Auto-marks stale issues/PRs after 90 days.
- **greetings.yml** — Welcomes first-time contributors.
- **dependabot-automerge.yml** — Auto-merges Dependabot PRs after build passes.

## Lessons Learned

1. **Prisma's type generation is a game changer** — No more manual TypeScript interfaces that drift from the database schema.
2. **NestJS ConfigModule with Joi** provides robust env validation out of the box.
3. **Dropping RxJS for simple CRUD** reduces boilerplate significantly. RxJS still shines for complex event streams, but for database CRUD, `async/await` is simpler.
4. **Global PrismaModule** eliminates repetitive imports across feature modules.
5. **Multi-stage Docker builds** with `prisma generate` in the build stage keep the production image lean.

## Next Steps

- Add input validation tests for DTOs
- Add E2E tests for all endpoints
- Consider adding pagination metadata (total count, page info)
- Explore Prisma's `prisma.$transaction` for atomic comment creation
- Add request logging middleware
- Consider re-adding authentication as an optional module
