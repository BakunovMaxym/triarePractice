import type { MigrationInterface, QueryRunner } from "typeorm";

export class ChangePrimaryKeyForTaskFile1746606433403 implements MigrationInterface {
    name = 'ChangePrimaryKeyForTaskFile1746606433403'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_files" DROP CONSTRAINT "PK_c62040a0d67843a8019183a63a0"`);
        await queryRunner.query(`ALTER TABLE "task_files" ADD CONSTRAINT "PK_867bc69a731d3792f60f825cd0c" PRIMARY KEY ("file_id")`);
        await queryRunner.query(`ALTER TABLE "task_files" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "task_files" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "task_files" DROP COLUMN "updated_at"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_files" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "task_files" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "task_files" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "task_files" DROP CONSTRAINT "PK_867bc69a731d3792f60f825cd0c"`);
        await queryRunner.query(`ALTER TABLE "task_files" ADD CONSTRAINT "PK_c62040a0d67843a8019183a63a0" PRIMARY KEY ("id", "file_id")`);
    }

}
