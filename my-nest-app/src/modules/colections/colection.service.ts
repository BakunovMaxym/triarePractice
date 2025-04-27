import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ColectionEntity } from './colection.entity';
import type { ColectionDto } from './dtos/colection.dto';
import type { CreateColectionDto } from './dtos/createColection.dto';
import { SetingsService } from '../../modules/setings/setings.service';

@Injectable()
export class ColectionService {
    constructor(
        @InjectRepository(ColectionEntity)
        private colectionRepository: Repository<ColectionEntity>,
        private setingsService: SetingsService,
    ) { }

    async getColections(): Promise<ColectionDto[]> {
        return this.colectionRepository.find({
            relations:{
                setings: true,
                propertyCards: true,
            }
        }).then((colections) => colections.map((colection) => colection.toDto()));

    }

    async getColection(ColectionId: Uuid): Promise<ColectionDto> {
        

        const colectionEntity = await this.colectionRepository.findOne({
            relations:{
                setings: true,
                propertyCards: true,
            },
            where: {
                id: ColectionId,
            },
        });

        if (!colectionEntity) {
            throw new NotFoundException();
        }

        return colectionEntity.toDto();
    }


    async createColection(colectionDto: CreateColectionDto): Promise<ColectionDto>{

        let settingsEntity = await this.setingsService.findOne(colectionDto.setings_id);
        console.log('Setings');

        if(!settingsEntity) {
            throw new NotFoundException('Setings not found');
        }
        console.log('Setings found', settingsEntity);
        const colectionEntity = this.colectionRepository.create({...colectionDto, setings: settingsEntity});
        return this.colectionRepository.save(colectionEntity).then((colection) => colection.toDto());
    }



}
