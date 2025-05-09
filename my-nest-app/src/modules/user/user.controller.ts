import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger';

import { RoleType } from '../../constants/role-type.ts';
import { AuthUser } from '../../decorators/auth-user.decorator.ts';
import { Auth } from '../../decorators/http.decorators.ts';
import { UseLanguageInterceptor } from '../../interceptors/language-interceptor.service.ts';
import { TranslationService } from '../../shared/services/translation.service.ts';
import { UserDto } from './dtos/user.dto.ts';
import { UserEntity } from './user.entity.ts';
import { UserService } from './user.service.ts';

@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(
    private userService: UserService,
    private readonly translationService: TranslationService,
  ) { }

  @Get('teacher')
  @Auth([RoleType.TEACHER])
  @HttpCode(HttpStatus.OK)
  @UseLanguageInterceptor()
  async admin(@AuthUser() user: UserEntity) {
    const translation = await this.translationService.translate(
      'admin.keywords.admin',
    );

    return {
      text: `${translation} ${user.firstName}`,
    };
  }

  @Get(":id")
  @ApiParam({ name: "id", type: String })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserDto, description: "" })
  getUser(@Param("id") id: Uuid): Promise<UserDto> {
    return this.userService.getUser(id);
  }

}
