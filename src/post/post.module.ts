import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { PostDataInitializerService } from './post-data-initializer.service';

@Module({
  controllers: [PostController],
  providers: [PostService, PostDataInitializerService],
})
export class PostModule {}
