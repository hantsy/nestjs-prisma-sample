import 'dotenv/config'
import { PrismaClient, Role } from '../prisma/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  // Clean existing data
  await prisma.comment.deleteMany()
  await prisma.post.deleteMany()
  await prisma.user.deleteMany()

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@example.com',
      password: 'password',
      firstName: 'Admin',
      lastName: 'User',
      roles: [Role.ADMIN],
    },
  })

  // Create regular user
  const user = await prisma.user.create({
    data: {
      username: 'hantsy',
      email: 'hantsy@example.com',
      password: 'password',
      firstName: 'Hantsy',
      lastName: 'Bai',
      roles: [Role.USER],
    },
  })

  // Create sample posts
  const posts = [
    {
      title: 'Generate a NestJS project',
      content:
        'Use the NestJS CLI to scaffold a fresh project with modern TypeScript setup.',
    },
    {
      title: 'Create CRUD RESTful APIs',
      content:
        'Build RESTful endpoints with NestJS controllers, services, and DTOs.',
    },
    {
      title: 'Connect to PostgreSQL with Prisma',
      content:
        'Use Prisma ORM to interact with PostgreSQL in a type-safe manner.',
    },
  ]

  for (const postData of posts) {
    const post = await prisma.post.create({
      data: {
        ...postData,
        authorId: user.id,
        comments: {
          create: {
            content: `Great post about ${postData.title.toLowerCase()}!`,
            authorId: admin.id,
          },
        },
      },
    })
    console.log(`Created post: ${post.title}`)
  }

  console.log({ admin, user })
  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
