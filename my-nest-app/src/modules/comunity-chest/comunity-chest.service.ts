import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateComunityChestDto } from './dto/create-comunity-chest.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ComunityChestEntity } from './entities/comunity-chest.entity';
import { Repository } from 'typeorm';
import { ColectionService } from '../../modules/colections/colection.service';
import type { ColectionDto } from '../../modules/colections/dtos/colection.dto';

@Injectable()
export class ComunityChestService {
  constructor(
    @InjectRepository(ComunityChestEntity)
    private readonly comunityChestRepository: Repository<ComunityChestEntity>,
    private readonly colectionService: ColectionService

  ){
  }


  async create(createComunityChestDto: CreateComunityChestDto) {
    const colection: ColectionDto = await this.colectionService.getColection(createComunityChestDto.colection_id)

    if(!colection){
      throw new NotFoundException('colection not founnd')
    }

    const comunityChest = this.comunityChestRepository.create({...createComunityChestDto, colection})
    return this.comunityChestRepository.save(comunityChest).then((comunityChest) => comunityChest.toDto())
  }

  findAllFromColection(id: Uuid) {
    const comunitychests = this.comunityChestRepository.find({
      where:{
        colection:{
          id:id
        }
      }
    })
    .then((comunityChests) => comunityChests.map((comunityChest) => comunityChest.toDto()))
  
    return comunitychests
  }

  findOne(id: Uuid) {
    const comunitychest = this.comunityChestRepository.findOneOrFail({
      where:{
        id:id
      }
    })
    .then((comunityChests) => comunityChests.toDto())
  
    return comunitychest
  }

  async clone(from: Uuid, to: Uuid) {
    const propertyCards = await this.findAllFromColection(from);
    
    propertyCards.forEach(async card => {
        let cloned: CreateComunityChestDto & {id?: Uuid} = {...card, colection_id: to};
        delete cloned.id;
        await this.create(cloned);
    })

    const savedCards = await this.findAllFromColection(to);
    console.log('cumChestu', savedCards)
    return savedCards;
}
  

}
