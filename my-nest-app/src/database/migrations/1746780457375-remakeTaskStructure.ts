import type { MigrationInterface, QueryRunner } from "typeorm";

export class RemakeTaskStructure1746780457375 implements MigrationInterface {
    name = 'RemakeTaskStructure1746780457375'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" ADD "time_to_complete" bigint`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "time_to_complete"`);
    }

}
