import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddChanceCardsAndTheirReletions1746614111826 implements MigrationInterface {
    name = 'AddChanceCardsAndTheirReletions1746614111826'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."chance-cards_type_enum" AS ENUM('pay_single', 'all_pay_me', 'go_to_jail', 'get_out_jail', 'go_and_wait', 'go_where_player_want')`);
        await queryRunner.query(`CREATE TABLE "chance-cards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "description" character varying NOT NULL, "type" "public"."chance-cards_type_enum" NOT NULL, "money" integer, "destination" character varying, "colection_id" uuid NOT NULL, CONSTRAINT "PK_fb2b29e5c43424477e0b46377be" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "comunity_chests" ALTER COLUMN "propertys" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "chance-cards" ADD CONSTRAINT "FK_c4b68744ab81c35d7ce3031b03f" FOREIGN KEY ("colection_id") REFERENCES "colections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chance-cards" DROP CONSTRAINT "FK_c4b68744ab81c35d7ce3031b03f"`);
        await queryRunner.query(`ALTER TABLE "comunity_chests" ALTER COLUMN "propertys" SET DEFAULT '[]'`);
        await queryRunner.query(`DROP TABLE "chance-cards"`);
        await queryRunner.query(`DROP TYPE "public"."chance-cards_type_enum"`);
    }

}
