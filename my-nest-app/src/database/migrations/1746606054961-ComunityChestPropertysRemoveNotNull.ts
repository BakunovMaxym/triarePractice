import type { MigrationInterface, QueryRunner } from "typeorm";

export class ComunityChestPropertysRemoveNotNull1746606054961 implements MigrationInterface {
    name = 'ComunityChestPropertysRemoveNotNull1746606054961'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comunity_chests" ALTER COLUMN "propertys" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comunity_chests" ALTER COLUMN "propertys" SET NOT NULL`);
    }

}
