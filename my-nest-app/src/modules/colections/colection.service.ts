import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ColectionEntity } from './colection.entity';
import type { ColectionDto } from './dtos/colection.dto';
import type { CreateColectionDto } from './dtos/createColection.dto';
import { SetingsService } from '../../modules/setings/setings.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class ColectionService {
    constructor(
        @InjectRepository(ColectionEntity)
        private colectionRepository: Repository<ColectionEntity>,
        private setingsService: SetingsService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache

    ) { }

    async getColections(): Promise<ColectionDto[]> {
        const cacheKey = 'colections';
        const cachedColections = await this.cacheManager.get<ColectionDto[]>(cacheKey);
        if(cachedColections){
            return cachedColections;
        }

        const colections = await this.colectionRepository.find({
            relations:{
                setings: true,
                propertyCards: true,
            }
        }).then((colections) => colections.map((colection) => colection.toDto()));

        this.cacheManager.set(cacheKey, colections, 60*60*1000);

        return colections

    }

    async getColection(ColectionId: Uuid): Promise<ColectionDto> {

        const cacheKey =`colection:${ColectionId}`;
        const cachedColection = await this.cacheManager.get<ColectionDto>(cacheKey);
        if(cachedColection){
            return cachedColection;
        }
        

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
        await this.cacheManager.set(cacheKey, colectionEntity, 60*60*1000);

        return colectionEntity.toDto();
    }
    async getColectionSmall(ColectionId: Uuid): Promise<ColectionDto> {
        const cacheKey =`colectionSmall:${ColectionId}`;
        const cachedColection = await this.cacheManager.get<ColectionDto>(cacheKey);
        if(cachedColection){
            return cachedColection;
        }
        
        

        const colectionEntity = await this.colectionRepository.findOne({
            relations:{
                setings: true,
            },
            where: {
                id: ColectionId,
            },
        });

        if (!colectionEntity) {
            throw new NotFoundException();
        }

        await this.cacheManager.set(cacheKey, colectionEntity, 60*60*1000);

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
        this.cacheManager.del('colections');
        return this.colectionRepository.save(colectionEntity).then((colection) => colection.toDto());
    }



}
