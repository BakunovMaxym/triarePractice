import type { MigrationInterface, QueryRunner } from "typeorm";

export class RemakeTaskStructure1746541760896 implements MigrationInterface {
    name = 'RemakeTaskStructure1746541760896'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "text_content"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "text_content" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "text_content"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "text_content" text`);
    }

}
