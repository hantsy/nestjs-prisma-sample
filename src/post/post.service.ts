import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(keyword?: string, skip = 0, limit = 10) {
    const where = keyword
      ? { title: { contains: keyword, mode: 'insensitive' as const } }
      : {};

    return this.prisma.post.findMany({
      where,
      skip,
      take: limit,
      include: {
        author: {
          select: { id: true, username: true, email: true },
        },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, username: true, email: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, username: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`post:${id} was not found`);
    }

    return post;
  }

  async save(data: CreatePostDto) {
    return this.prisma.post.create({ data });
  }

  async update(id: string, data: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException(`post:${id} was not found`);
    }

    return this.prisma.post.update({ where: { id }, data });
  }

  async deleteById(id: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException(`post:${id} was not found`);
    }

    // Delete related comments first
    await this.prisma.comment.deleteMany({ where: { postId: id } });
    return this.prisma.post.delete({ where: { id } });
  }

  // Comment actions
  async createCommentFor(postId: string, data: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`post:${postId} was not found`);
    }

    return this.prisma.comment.create({
      data: {
        content: data.content,
        postId,
      },
    });
  }

  async commentsOf(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: { id: true, username: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}
