import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddTurnOrder1746517661879 implements MigrationInterface {
    name = 'AddTurnOrder1746517661879'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "games" ADD "turn_order" text NOT NULL DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "games" ADD "current_turn" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "games" DROP COLUMN "current_turn"`);
        await queryRunner.query(`ALTER TABLE "games" DROP COLUMN "turn_order"`);
    }

}
