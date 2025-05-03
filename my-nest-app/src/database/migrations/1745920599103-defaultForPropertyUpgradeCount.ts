import type { MigrationInterface, QueryRunner } from "typeorm";

export class DefaultForPropertyUpgradeCount1745920599103 implements MigrationInterface {
    name = 'DefaultForPropertyUpgradeCount1745920599103'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "propertys" ALTER COLUMN "upgrade_count" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "propertys" ALTER COLUMN "upgrade_count" DROP DEFAULT`);
    }

}
