import type { MigrationInterface, QueryRunner } from "typeorm";

export class RemakeTaskStructure1746508154967 implements MigrationInterface {
    name = 'RemakeTaskStructure1746508154967'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "task_files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "file_id" character varying NOT NULL, "file_name" character varying NOT NULL, "file_url" character varying NOT NULL, "task_id" uuid, CONSTRAINT "PK_ef0155509609893f1c0cb9811a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "file_content"`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "task_files" ADD CONSTRAINT "FK_e302f4010ff50a1e8199a489090" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_files" DROP CONSTRAINT "FK_e302f4010ff50a1e8199a489090"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "file_content" text`);
        await queryRunner.query(`DROP TABLE "task_files"`);
    }

}
