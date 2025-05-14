import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddABORTED1746440255783 implements MigrationInterface {
    name = 'AddABORTED1746440255783'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."games_status_enum" RENAME TO "games_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."games_status_enum" AS ENUM('waiting_players', 'in_progress', 'finished', 'aborted')`);
        await queryRunner.query(`ALTER TABLE "games" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "games" ALTER COLUMN "status" TYPE "public"."games_status_enum" USING "status"::"text"::"public"."games_status_enum"`);
        await queryRunner.query(`ALTER TABLE "games" ALTER COLUMN "status" SET DEFAULT 'waiting_players'`);
        await queryRunner.query(`DROP TYPE "public"."games_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."games_status_enum_old" AS ENUM('waiting_players', 'in_progress', 'finished')`);
        await queryRunner.query(`ALTER TABLE "games" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "games" ALTER COLUMN "status" TYPE "public"."games_status_enum_old" USING "status"::"text"::"public"."games_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "games" ALTER COLUMN "status" SET DEFAULT 'waiting_players'`);
        await queryRunner.query(`DROP TYPE "public"."games_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."games_status_enum_old" RENAME TO "games_status_enum"`);
    }

}
