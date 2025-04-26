import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddReletionship21745572168392 implements MigrationInterface {
    name = 'AddReletionship21745572168392'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "colections" DROP CONSTRAINT "FK_8a5c60ab3f2a7835a0ea809a691"`);
        await queryRunner.query(`ALTER TABLE "colections" ADD CONSTRAINT "FK_8a5c60ab3f2a7835a0ea809a691" FOREIGN KEY ("setings_id") REFERENCES "settings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "colections" DROP CONSTRAINT "FK_8a5c60ab3f2a7835a0ea809a691"`);
        await queryRunner.query(`ALTER TABLE "colections" ADD CONSTRAINT "FK_8a5c60ab3f2a7835a0ea809a691" FOREIGN KEY ("setings_id") REFERENCES "colections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
