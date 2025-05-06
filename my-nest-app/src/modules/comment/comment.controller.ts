import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Delete,
  ParseUUIDPipe,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
  ApiOkResponse,
} from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';

@ApiTags('comments')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

@Post('comment/:TaskId')
@HttpCode(201)
@ApiOperation({ summary: 'Create a new comment' })
@ApiParam({
  name: 'TaskId',
  description: 'UUID of the Task',
  type: 'string',
  format: 'uuid',
})
@ApiOkResponse({
  description: 'Comment created successfully',
  type: Comment,
})
async create(
  @Param('taskId')taskId: Uuid,
  @Body() createCommentDto: CreateCommentDto,
): Promise<Comment> {
  return this.commentService.create(taskId, createCommentDto);
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
