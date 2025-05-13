import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRegisterDto } from '../auth/dto/user-register.dto.ts';
import { UserDto } from './dtos/user.dto.ts';
import { UserEntity } from './user.entity.ts';
import { InjectRepository } from '@nestjs/typeorm';
import type { FindOptionsWhere, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
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
}
