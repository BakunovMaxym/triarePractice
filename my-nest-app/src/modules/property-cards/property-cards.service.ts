import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePropertyCardDto } from './dto/create-property-card.dto';
import { ColectionService } from '../../modules/colections/colection.service';
import  { Repository } from 'typeorm';
import { PropertyCardEntity } from './entities/property-card.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class PropertyCardsService{

  constructor(
    @InjectRepository(PropertyCardEntity)
    private propertyCardRepository: Repository<PropertyCardEntity>,
    private readonly colectionService: ColectionService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache

  ) {}
 


  async create(createPropertyCardDto: CreatePropertyCardDto) {

    let colection = await this.colectionService.getColection(createPropertyCardDto.colection_id);
    if (!colection) {
      throw new NotFoundException('Colection not found');
    }
    const propertyCard = this.propertyCardRepository.create({ ...createPropertyCardDto, colection });
    
    this.cacheManager.del('colections');
    this.cacheManager.del(`colection:${createPropertyCardDto.colection_id}`);
    this.cacheManager.del(`colectionSmall:${createPropertyCardDto.colection_id}`);
    this.cacheManager.del(`propertyCardsOfColecion:${createPropertyCardDto.colection_id}`);

    this.cacheManager.del('propertyCards');

    return this.propertyCardRepository.save(propertyCard).then((propertyCard) => propertyCard.toDto());

  }

  async findAll() {
    const cacheKey = 'propertyCards';
    const cachedPropertyCards = await this.cacheManager.get(cacheKey);
    if (cachedPropertyCards) {
      return cachedPropertyCards;
    }

    const properties = await this.propertyCardRepository.find().then((propertyCards) => propertyCards.map((propertyCard) => propertyCard.toDto()));
    
    this.cacheManager.set(cacheKey, properties, 60 * 60 * 1000); 

    return properties;
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

  async findByColectionId(id: Uuid) {

    const cachedResylt = await this.cacheManager.get(`propertyCardsOfColecion:${id}`)
    if (cachedResylt) {
      return cachedResylt;
    }

    const queryBuilder = this.propertyCardRepository.createQueryBuilder('propertyCard');
    queryBuilder.where('colection_id = :id', { id });

    return queryBuilder.getMany().then((propertyCards) => {
      if (!propertyCards || propertyCards.length === 0) {
        throw new NotFoundException('Property cards not found');
      }
      
      const result = propertyCards.map((propertyCard) => propertyCard.toDto())

      this.cacheManager.set(`propertyCardsOfColecion:${id}`, result, 60*60*1000)
      return result;
    });
  }

  
  
}
