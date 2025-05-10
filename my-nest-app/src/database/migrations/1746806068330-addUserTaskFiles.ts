import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserTaskFiles1746806068330 implements MigrationInterface {
    name = 'AddUserTaskFiles1746806068330'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_task_files" ("file_id" character varying NOT NULL, "file_name" character varying NOT NULL, "file_url" character varying NOT NULL, "user_task_id" uuid, CONSTRAINT "PK_b14256e2f51afa25627bf184991" PRIMARY KEY ("file_id"))`);
        await queryRunner.query(`ALTER TABLE "user_task_files" ADD CONSTRAINT "FK_4293abc0fe671281da6a0a1d8bd" FOREIGN KEY ("user_task_id") REFERENCES "user_tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_task_files" DROP CONSTRAINT "FK_4293abc0fe671281da6a0a1d8bd"`);
        await queryRunner.query(`DROP TABLE "user_task_files"`);
    }

}
