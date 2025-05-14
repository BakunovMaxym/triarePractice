import type { MigrationInterface, QueryRunner } from "typeorm";

export class AdedStatusToGame1746439530279 implements MigrationInterface {
    name = 'AdedStatusToGame1746439530279'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."games_status_enum" AS ENUM('waiting_players', 'in_progress', 'finished')`);
        await queryRunner.query(`ALTER TABLE "games" ADD "status" "public"."games_status_enum" NOT NULL DEFAULT 'waiting_players'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "games" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."games_status_enum"`);
    }

}
