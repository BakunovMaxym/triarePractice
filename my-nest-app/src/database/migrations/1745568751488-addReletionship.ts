import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddReletionship1745568751488 implements MigrationInterface {
    name = 'AddReletionship1745568751488'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "colections" ADD "setings_id" uuid`);
        await queryRunner.query(`ALTER TABLE "colections" ADD CONSTRAINT "UQ_8a5c60ab3f2a7835a0ea809a691" UNIQUE ("setings_id")`);
        await queryRunner.query(`ALTER TABLE "colections" ADD CONSTRAINT "FK_8a5c60ab3f2a7835a0ea809a691" FOREIGN KEY ("setings_id") REFERENCES "colections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "colections" DROP CONSTRAINT "FK_8a5c60ab3f2a7835a0ea809a691"`);
        await queryRunner.query(`ALTER TABLE "colections" DROP CONSTRAINT "UQ_8a5c60ab3f2a7835a0ea809a691"`);
        await queryRunner.query(`ALTER TABLE "colections" DROP COLUMN "setings_id"`);
    }

}
