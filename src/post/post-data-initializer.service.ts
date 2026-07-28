import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostDataInitializerService implements OnModuleInit {
  private readonly logger = new Logger(PostDataInitializerService.name);

  private data = [
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
  ];

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    if (process.env.SEED_DATABASE !== 'true') return;

    this.logger.log('(PostModule) is initialized...');

    const existing = await this.prisma.post.count();
    if (existing > 0) return;

    for (const postData of this.data) {
      const post = await this.prisma.post.create({ data: postData });
      this.logger.log(`Created post: ${post.title}`);
    }
  }
}
