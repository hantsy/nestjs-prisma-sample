import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUsername(username: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });

    if (!user) {
      throw new NotFoundException(`user:${username} was not found`);
    }

    return user;
  }

  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { username } });
    return count > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { email } });
    return count > 0;
  }

  async register(data: RegisterDto) {
    return this.prisma.user.create({ data });
  }

  async findById(id: string, withPosts: boolean = false) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        posts: withPosts
          ? {
              orderBy: { createdAt: 'desc' },
              include: {
                _count: { select: { comments: true } },
              },
            }
          : false,
      },
    });

    if (!user) {
      throw new NotFoundException(`user:${id} was not found`);
    }

    return user;
  }
}
