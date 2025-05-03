import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddGameAndPropertyReletions1745837777173 implements MigrationInterface {
    name = 'AddGameAndPropertyReletions1745837777173'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "games" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "colection_id" uuid, CONSTRAINT "PK_c9b16b62917b5595af982d66337" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "propertys" ADD "game_id" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD "game_id" uuid`);
        await queryRunner.query(`ALTER TABLE "games" ADD CONSTRAINT "FK_c109282d9132e2ab5a27b8339f2" FOREIGN KEY ("colection_id") REFERENCES "colections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "propertys" ADD CONSTRAINT "FK_ea73051ce1b402d29c5e39b0509" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_450e4a5da02d474ec40a9c85e8e" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_450e4a5da02d474ec40a9c85e8e"`);
        await queryRunner.query(`ALTER TABLE "propertys" DROP CONSTRAINT "FK_ea73051ce1b402d29c5e39b0509"`);
        await queryRunner.query(`ALTER TABLE "games" DROP CONSTRAINT "FK_c109282d9132e2ab5a27b8339f2"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "game_id"`);
        await queryRunner.query(`ALTER TABLE "propertys" DROP COLUMN "game_id"`);
        await queryRunner.query(`DROP TABLE "games"`);
    }

}
