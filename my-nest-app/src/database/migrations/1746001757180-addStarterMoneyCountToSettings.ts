import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddStarterMoneyCountToSettings1746001757180 implements MigrationInterface {
    name = 'AddStarterMoneyCountToSettings1746001757180'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "settings" ADD "starter_money" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "settings" DROP COLUMN "starter_money"`);
    }

}
