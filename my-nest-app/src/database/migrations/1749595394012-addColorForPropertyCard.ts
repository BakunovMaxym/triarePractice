import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddColorForPropertyCard1749595394012 implements MigrationInterface {
    name = 'AddColorForPropertyCard1749595394012'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "property_cards" ADD "color" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "property_cards" DROP COLUMN "color"`);
    }

}
