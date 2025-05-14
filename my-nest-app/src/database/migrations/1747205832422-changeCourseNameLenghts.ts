import type { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeCourseNameLenghts1747205832422 implements MigrationInterface {
    name = 'ChangeCourseNameLenghts1747205832422'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "name" character varying(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "name" character varying NOT NULL`);
    }

}
