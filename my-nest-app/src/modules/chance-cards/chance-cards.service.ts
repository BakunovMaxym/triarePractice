import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChanceCardDto } from './dto/create-chance-card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ChanceCardEntity } from './entities/chance-card.entity';
import { Repository } from 'typeorm';
import { ColectionService } from '../../modules/colections/colection.service';
import type { ColectionDto } from '../../modules/colections/dtos/colection.dto';

@Injectable()
export class ChanceCardsService {

  constructor(
    @InjectRepository(ChanceCardEntity)
    private readonly chanceCardRepository: Repository<ChanceCardEntity>,
    private readonly colectionService: ColectionService
  ){
    
  }

  async create(createChanceCardDto: CreateChanceCardDto) {
   const colection: ColectionDto = await this.colectionService.getColection(createChanceCardDto.colectionId)
   
       if(!colection){
         throw new NotFoundException('colection not founnd')
       }
   
       const chanceCard = this.chanceCardRepository.create({...createChanceCardDto, colection})
       return this.chanceCardRepository.save(chanceCard).then((chanceCard) => chanceCard.toDto())
  }

  findAll() {
    return this.chanceCardRepository.find().then((chanceCards) => chanceCards.map((chanceCard) => chanceCard.toDto()));
  }
  findAllByColectionId(id: Uuid) {
    return this.chanceCardRepository.find(
      {
        where:{
          colection:{
            id
          }
        }
      }
    ).then((chanceCards) => chanceCards.map((chanceCard) => chanceCard.toDto()));

  }

  findOne(id: Uuid) {
    return this.chanceCardRepository.findOneOrFail({
      where:{
        id
      }
    }).then((chanceCard) => chanceCard.toDto());

  }

    async clone(from: Uuid, to: Uuid) {
      const propertyCards = await this.findAllByColectionId(from);
      
      propertyCards.forEach(async card => {
          let cloned: CreateChanceCardDto & {id?: Uuid} = {...card, colectionId: to};
        delete cloned.id;

          await this.create(cloned);;
      })
  
      const savedCards = await this.findAllByColectionId(to);
      return savedCards;
  }
    

 
}
