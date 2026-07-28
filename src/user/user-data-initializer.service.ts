import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UserDataInitializerService implements OnModuleInit {
  private readonly logger = new Logger(UserDataInitializerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    if (process.env.SEED_DATABASE !== 'true') return;

    this.logger.log('(UserModule) is initialized...');

    const existing = await this.prisma.user.count();
    if (existing > 0) return;

    const user = {
      username: 'hantsy',
      password: 'password',
      email: 'hantsy@example.com',
      firstName: 'Hantsy',
      lastName: 'Bai',
      roles: [Role.USER],
    };

    const admin = {
      username: 'admin',
      password: 'password',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      roles: [Role.ADMIN],
    };

    await this.prisma.user.createMany({ data: [user, admin] });
    this.logger.log('Created users: hantsy, admin');
  }
}
