import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SetingsEntity } from './setings.entity';
import type {  Repository } from 'typeorm';
import type { SetingsDto } from './dtos/setings.dto';
import type { CreateSetingsDto } from './dtos/createSetings.dto';


@Injectable()
export class SetingsService {
    constructor(
        @InjectRepository(SetingsEntity)
        private setingsRepository: Repository<SetingsEntity>,
    ) { }

    async getSetings(): Promise<SetingsDto[]> {
        return this.setingsRepository.find().then((setings) => setings.map((setings) => setings.toDto()));
    }

    async findOne(setingsId: Uuid): Promise<SetingsEntity> {

        const queryBuilder = this.setingsRepository.createQueryBuilder('settings');

        queryBuilder.where('settings.id = :setingsId', { setingsId });

        const setingsEntity = await queryBuilder.getOne();

        if (!setingsEntity) {
            throw new NotFoundException();
        }

        return setingsEntity;

    }

    async createSetings(setingsDto: CreateSetingsDto): Promise<SetingsDto> {
        const setingsEntity = this.setingsRepository.create(setingsDto);
        return this.setingsRepository.save(setingsEntity).then((setings) => setings.toDto());
    }

}
