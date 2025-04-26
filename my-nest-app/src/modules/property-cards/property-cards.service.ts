import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePropertyCardDto } from './dto/create-property-card.dto';
import { ColectionService } from '../../modules/colections/colection.service';
import  { Repository } from 'typeorm';
import { PropertyCardEntity } from './entities/property-card.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PropertyCardsService {

  constructor(
    @InjectRepository(PropertyCardEntity)
    private propertyCardRepository: Repository<PropertyCardEntity>,
    private readonly colectionService: ColectionService,
  ) {}



  async create(createPropertyCardDto: CreatePropertyCardDto) {
    let colection = await this.colectionService.getColection(createPropertyCardDto.colection_id);
    if (!colection) {
      throw new NotFoundException('Colection not found');
    }
    const propertyCard = this.propertyCardRepository.create({ ...createPropertyCardDto, colection });
    return this.propertyCardRepository.save(propertyCard).then((propertyCard) => propertyCard.toDto());

  }

  findAll() {
    return this.propertyCardRepository.find().then((propertyCards) => propertyCards.map((propertyCard) => propertyCard.toDto()));
  }

  findOne(id: Uuid) {
    const queryBuilder = this.propertyCardRepository.createQueryBuilder('propertyCard');
    queryBuilder.where('propertyCard.id = :id', { id });
    return queryBuilder.getOne().then((propertyCard) => {
      if (!propertyCard) {
        throw new NotFoundException('Property card not found');
      }
      return propertyCard.toDto();
    });
  }

  
  
}
