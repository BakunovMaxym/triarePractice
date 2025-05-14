import type { MigrationInterface, QueryRunner } from "typeorm";

export class AlmostFinalMigration1747227909409 implements MigrationInterface {
    name = 'AlmostFinalMigration1747227909409'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "turns" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "propertys" json NOT NULL, "users" json NOT NULL, "game_id" uuid, "user_id" uuid, CONSTRAINT "PK_66edaea493f45e3c39d7c3553ed" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "in_jail" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "doubles_count" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "get_out_of_jail_card" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "jail_time" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TYPE "public"."property_cards_type_enum" RENAME TO "property_cards_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."property_cards_type_enum" AS ENUM('STANDART', 'FOURTYPE', 'DICETYP', 'PRISON', 'GO_TO_PRISON', 'CHANCE', 'COMUNITY_CHEST')`);
        await queryRunner.query(`ALTER TABLE "property_cards" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "property_cards" ALTER COLUMN "type" TYPE "public"."property_cards_type_enum" USING "type"::"text"::"public"."property_cards_type_enum"`);
        await queryRunner.query(`ALTER TABLE "property_cards" ALTER COLUMN "type" SET DEFAULT 'STANDART'`);
        await queryRunner.query(`DROP TYPE "public"."property_cards_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "turns" ADD CONSTRAINT "FK_a90112defc0024aae729f4b2056" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "turns" ADD CONSTRAINT "FK_c720cb877655a35233b4053d775" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "turns" DROP CONSTRAINT "FK_c720cb877655a35233b4053d775"`);
        await queryRunner.query(`ALTER TABLE "turns" DROP CONSTRAINT "FK_a90112defc0024aae729f4b2056"`);
        await queryRunner.query(`CREATE TYPE "public"."property_cards_type_enum_old" AS ENUM('STANDART', 'FOURTYPE', 'DiCETYP')`);
        await queryRunner.query(`ALTER TABLE "property_cards" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "property_cards" ALTER COLUMN "type" TYPE "public"."property_cards_type_enum_old" USING "type"::"text"::"public"."property_cards_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "property_cards" ALTER COLUMN "type" SET DEFAULT 'STANDART'`);
        await queryRunner.query(`DROP TYPE "public"."property_cards_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."property_cards_type_enum_old" RENAME TO "property_cards_type_enum"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "jail_time"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "get_out_of_jail_card"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "doubles_count"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "in_jail"`);
        await queryRunner.query(`DROP TABLE "turns"`);
    }

}
