import type  { MigrationInterface, QueryRunner } from "typeorm";

export class AddComunityChestAndItsRelations1746605937995 implements MigrationInterface {
    name = 'AddComunityChestAndItsRelations1746605937995'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."comunity_chests_type_enum" AS ENUM('money_by_property', 'money_by_both_building', 'money_by_house')`);
        await queryRunner.query(`CREATE TABLE "comunity_chests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "description" character varying NOT NULL, "type" "public"."comunity_chests_type_enum" NOT NULL, "money_for_property" integer, "propertys" text NOT NULL DEFAULT '[]', "money_for_hotel" integer, "is_hotels" boolean, "money_for_house" integer, "is_houses" boolean, "colection_id" uuid, CONSTRAINT "PK_8f87638f07cfb131b67faae4de5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "comunity_chests" ADD CONSTRAINT "FK_eb721cac43203fd50c7a3ff438b" FOREIGN KEY ("colection_id") REFERENCES "colections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comunity_chests" DROP CONSTRAINT "FK_eb721cac43203fd50c7a3ff438b"`);
        await queryRunner.query(`DROP TABLE "comunity_chests"`);
        await queryRunner.query(`DROP TYPE "public"."comunity_chests_type_enum"`);
    }

}
