import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ColectionEntity } from './colection.entity';
import type { ColectionsPageOptionsDto } from './dtos/colections-page-options.dto';
import type { ColectionDto } from './dtos/colection.dto';
import type { PageDto } from 'common/dto/page.dto';
import type { CreateColectionDto } from './dtos/createColection.dto';
import { SetingsService } from '../../modules/setings/setings.service';

@Injectable()
export class ColectionService {
    constructor(
        @InjectRepository(ColectionEntity)
        private colectionRepository: Repository<ColectionEntity>,
        private setingsService: SetingsService,
    ) { }

    async getColections(pageOptionsDto: ColectionsPageOptionsDto,): Promise<PageDto<ColectionDto>> {
        const queryBuilder = this.colectionRepository.createQueryBuilder('colection');
        const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

        return items.toPageDto(pageMetaDto);
    }

    async getColection(ColectionId: Uuid): Promise<ColectionDto> {
        const queryBuilder = this.colectionRepository.createQueryBuilder('colection');

        queryBuilder.where('colection.id = :ColectionId', { ColectionId });

        const colectionEntity = await queryBuilder.getOne();

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
