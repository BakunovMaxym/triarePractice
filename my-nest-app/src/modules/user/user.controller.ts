import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,

} from '@nestjs/common';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../common/dto/page.dto.ts';
import { ApiPageResponse } from '../../decorators/api-page-response.decorator.ts';
import {  UUIDParam } from '../../decorators/http.decorators.ts';
import { UserDto } from './dtos/user.dto.ts';
import { UserService } from './user.service.ts';

@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(
    private userService: UserService,

  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiPageResponse({
    description: 'Get users list',
    type: PageDto,
  })
  getUsers(): Promise<UserDto[]> {
    return this.userService.getUsers();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get users list',
    type: UserDto,
  })
  @ApiParam({name: 'id', type: String})
  getUser(@UUIDParam('id') userId: Uuid): Promise<UserDto> {
    return this.userService.getUser(userId);
  }
}
