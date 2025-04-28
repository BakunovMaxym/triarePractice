import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePropertyDto } from './dto/create-property.dto';
import { InjectRepository } from '@nestjs/typeorm';
import  { Repository } from 'typeorm';
import { PropertyEntity } from './entities/property.entity';
import  { PropertyDto } from './dto/property.dto';
import { PropertyCardsService } from '../../modules/property-cards/property-cards.service';
import  { PropertyCardDto } from '../../modules/property-cards/dto/property-card.dto';

@Injectable()
export class PropertyService {

  constructor(
    @InjectRepository(PropertyEntity)
    private propertyRepository: Repository<PropertyEntity>,
    private readonly propertyCardService: PropertyCardsService,
  ) { }



  async create(createPropertyDto: CreatePropertyDto) {
    const propertyCard: PropertyCardDto = await this.propertyCardService.findOne(createPropertyDto.property);
    if (!propertyCard) {
      throw new NotFoundException('Property card not found');
    }
    const property = this.propertyRepository.create({property : propertyCard});
    return this.propertyRepository.save(property).then((property) => property.toDto());
  }

  findAll() : Promise<PropertyDto[]> {
    return this.propertyRepository.find({relations:{
      property: true,
    }
  }).then((properties) => properties.map((property) => property.toDto()));
  }

  findOne(id: Uuid) : Promise<PropertyDto> {
    return this.propertyRepository.findOne({
      where:{
        id:id
      },
      relations:{
        property: true,
      }
    }).then((property) => {
      if(!property) {
        throw new NotFoundException('Property not found');
      }
      return property.toDto()
    });
  }

  


}
