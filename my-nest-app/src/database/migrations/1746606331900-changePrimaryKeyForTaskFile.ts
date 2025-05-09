import type { MigrationInterface, QueryRunner } from "typeorm";

export class ChangePrimaryKeyForTaskFile1746606331900 implements MigrationInterface {
    name = 'ChangePrimaryKeyForTaskFile1746606331900'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "task_files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "file_id" character varying NOT NULL, "file_name" character varying NOT NULL, "file_url" character varying NOT NULL, "task_id" uuid, CONSTRAINT "PK_c62040a0d67843a8019183a63a0" PRIMARY KEY ("id", "file_id"))`);
        await queryRunner.query(`ALTER TABLE "task_files" ADD CONSTRAINT "FK_e302f4010ff50a1e8199a489090" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_files" DROP CONSTRAINT "FK_e302f4010ff50a1e8199a489090"`);
        await queryRunner.query(`DROP TABLE "task_files"`);
    }

}
