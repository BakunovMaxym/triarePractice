import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserTaskFiles1747244299338 implements MigrationInterface {
    name = 'AddUserTaskFiles1747244299338'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "folders" ADD "course_ids" uuid array`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "name" character varying(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "folders" DROP COLUMN "course_ids"`);
    }

}
