import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { PostService } from './post.service';
import { UpdatePostDto } from './dto/update-post.dto';

@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @ApiQuery({ name: 'q', required: false, description: 'Search keyword' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Page size',
    example: 10,
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'Offset',
    example: 0,
  })
  @ApiOkResponse({ description: 'List of posts.' })
  async getAllPosts(
    @Query('q') keyword?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip?: number,
  ) {
    return this.postService.findAll(keyword, skip, limit);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Post found.' })
  @ApiNotFoundResponse({ description: 'Post not found.' })
  async getPostById(@Param('id') id: string) {
    return this.postService.findById(id);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Post created.' })
  async createPost(
    @Body() post: CreatePostDto,
    @Res() res: Response,
  ): Promise<Response> {
    const created = await this.postService.save(post);
    return res
      .location('/posts/' + created.id)
      .status(201)
      .send();
  }

  @Put(':id')
  @ApiNoContentResponse({ description: 'Post updated.' })
  @ApiNotFoundResponse({ description: 'Post not found.' })
  async updatePost(
    @Param('id') id: string,
    @Body() post: UpdatePostDto,
    @Res() res: Response,
  ): Promise<Response> {
    await this.postService.update(id, post);
    return res.status(204).send();
  }

  @Delete(':id')
  @ApiNoContentResponse({ description: 'Post deleted.' })
  @ApiNotFoundResponse({ description: 'Post not found.' })
  async deletePostById(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<Response> {
    await this.postService.deleteById(id);
    return res.status(204).send();
  }

  @Post(':id/comments')
  @ApiCreatedResponse({ description: 'Comment created.' })
  async createCommentForPost(
    @Param('id') id: string,
    @Body() data: CreateCommentDto,
    @Res() res: Response,
  ): Promise<Response> {
    const comment = await this.postService.createCommentFor(id, data);
    return res
      .location('/posts/' + id + '/comments/' + comment.id)
      .status(201)
      .send();
  }

  @Get(':id/comments')
  @ApiOkResponse({ description: 'List of comments for the post.' })
  async getAllCommentsOfPost(@Param('id') id: string) {
    return this.postService.commentsOf(id);
  }
}
