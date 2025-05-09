import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UserRegisterDto } from '../auth/dto/user-register.dto.ts';
import { CreateSettingsCommand } from './commands/create-settings.command.ts';
import { CreateSettingsDto } from './dtos/create-settings.dto.ts';
import { UserDto } from './dtos/user.dto.ts';
import { UserEntity } from './user.entity.ts';
import type { UserSettingsEntity } from './user-settings.entity.ts';
import { InjectRepository } from '@nestjs/typeorm';
import type { FindOptionsWhere, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    // private validatorService: ValidatorService,
    // private awsS3Service: AwsS3Service,
    private commandBus: CommandBus,
  ) { }

  /**
   * Find single user
   */
  findOne(findData: FindOptionsWhere<UserEntity>): Promise<UserEntity | null> {
    return this.userRepository.findOneBy(findData);
  }

  findByUsernameOrEmail(
    options: Partial<{ username: string; email: string }>,
  ): Promise<UserEntity | null> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    // .leftJoinAndSelect<UserEntity, 'user'>('user.settings', 'settings');

    if (options.email) {
      queryBuilder.orWhere('user.email = :email', {
        email: options.email,
      });
    }

    if (options.username) {
      queryBuilder.orWhere('user.username = :username', {
        username: options.username,
      });
    }

    return queryBuilder.getOne();
  }

  @Transactional()
  async createUser(userRegisterDto: UserRegisterDto): Promise<UserEntity> {
    const user = this.userRepository.create(userRegisterDto);
    await this.userRepository.save(user);

    return user;
  }



  async getUser(id: Uuid): Promise<UserDto> {
    const user = await this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.teachCourses', 'teachCourse')
      .leftJoinAndSelect('teachCourse.owner', 'courseOwner')
      .leftJoinAndSelect('teachCourse.students', 'courseStudents')
      .leftJoinAndSelect('teachCourse.teachers', 'courseTeachers')
      .select([
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'teachCourse.id',
        'teachCourse.name',
        'courseOwner.id', 'courseOwner.firstName', 'courseOwner.lastName',
        'courseStudents.id', 'courseStudents.firstName', 'courseStudents.lastName',
        'courseTeachers.id', 'courseTeachers.firstName', 'courseTeachers.lastName',
      ])
      .where("user.id = :id", { id })
      .getOne()
    if (!user) {
      throw NotFoundException
    }

    const finalUser = new UserDto(user)

    return finalUser;
  }

  // async getUser(userId: Uuid): Promise<UserDto> {
  //   const queryBuilder = this.userRepository.createQueryBuilder('user');

  //   queryBuilder.where('user.id = :userId', { userId });

  //   const userEntity = await queryBuilder.getOne();

  //   if (!userEntity) {
  //     throw new UserNotFoundException();
  //   }

  //   return userEntity.toDto();
  // }

  createSettings(
    userId: Uuid,
    createSettingsDto: CreateSettingsDto,
  ): Promise<UserSettingsEntity> {
    return this.commandBus.execute<CreateSettingsCommand, UserSettingsEntity>(
      new CreateSettingsCommand(userId, createSettingsDto),
    );
  }
}
