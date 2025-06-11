import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import { UserNotFoundException } from '../../exceptions/user-not-found.exception.ts';
import { UserRegisterDto } from '../auth/dto/user-register.dto.ts';
import type { UserDto } from './dtos/user.dto.ts';
import { UserEntity } from './user.entity.ts';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

  ) {}



  @Transactional()
  async createUser(
    userRegisterDto: UserRegisterDto,
  ): Promise<UserEntity> {
    const user = this.userRepository.create(userRegisterDto);
    await this.userRepository.save(user);
    return user;
  }

  async getUsers(): Promise<UserDto[]> {
    return this.userRepository.find().then((users) => users.map((user) => user.toDto()));
  }

  async getUser(userId: Uuid): Promise<UserDto> {
    

    const userEntity = await this.userRepository.findOne({
      where: {
        id: userId
      },
      relations: {
        game: {
          propertys: {
            property: true,
            owner: true
          },
          users: true,
          colection: {
            setings: true
          }
        },
        properties:{
          property: true,
          owner: true,
        }
      }
    });

    if (!userEntity) {
      throw new UserNotFoundException();
    }

    return userEntity.toDto();
  }

  async save(user:UserDto){
    await this.userRepository.save(user)
  }
}
