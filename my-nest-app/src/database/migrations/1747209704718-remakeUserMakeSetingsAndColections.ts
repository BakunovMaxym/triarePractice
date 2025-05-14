import { MigrationInterface, QueryRunner } from "typeorm";

export class RemakeUserMakeSetingsAndColections1747209704718 implements MigrationInterface {
    name = 'RemakeUserMakeSetingsAndColections1747209704718'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "folders" ADD "course_ids" uuid array`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "folders" DROP COLUMN "course_ids"`);
    }

}
