import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';

@ApiTags('comments')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({
    status: 201,
    description: 'The comment has been successfully created.',
    type: Comment,
  })
  create(@Body() dto: CreateCommentDto): Promise<Comment> {
    return this.commentService.create(dto);
  }

  @Get('task/:taskId')
  @ApiOperation({ summary: 'Get all comments by Task ID' })
  @ApiParam({
    name: 'taskId',
    description: 'UUID of the Task',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'List of comments for the given task',
    type: [Comment],
  })
  getByTask(
    @Param('taskId', new ParseUUIDPipe()) taskId: Uuid,
  ): Promise<Comment[]> {
    return this.commentService.findByTask(taskId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment by its ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the Comment',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'Comment successfully deleted.',
  })
  remove(
    @Param('id', new ParseUUIDPipe()) id: Uuid,
  ): Promise<void> {
    return this.commentService.delete(id);
  }
}
