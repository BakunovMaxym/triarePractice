import type { MigrationInterface, QueryRunner } from "typeorm";

export class ImplementFolders1747131226170 implements MigrationInterface {
    name = 'ImplementFolders1747131226170'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" ADD "folder_id" uuid`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_3c3705fcaf954ec45a47501dcc7" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_3c3705fcaf954ec45a47501dcc7"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "folder_id"`);
    }

}
