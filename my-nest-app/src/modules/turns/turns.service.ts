import { Injectable } from '@nestjs/common';
import { CreateTurnDto } from './dto/create-turn.dto';
import { Repository } from 'typeorm';
import { TurnEntity } from './entities/turn.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TurnsService {

  constructor(
    @InjectRepository(TurnEntity)
     private readonly turnRepository: Repository<TurnEntity>
  ){

  }
  create(createTurnDto: CreateTurnDto) {
    const TurnEntity = this.turnRepository.create(createTurnDto)
    return this.turnRepository.save(TurnEntity);
  }

  findAll() {
    return this.turnRepository.find();
  }

  findOne(id: Uuid) {
    return this.turnRepository.findOneOrFail({where:{id}});
  }

  
}
