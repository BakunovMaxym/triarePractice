import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddPropertyCards1745576232146 implements MigrationInterface {
    name = 'AddPropertyCards1745576232146'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "property_cards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "type" character varying NOT NULL, "price" integer NOT NULL, "street" character varying NOT NULL, "upgrade_price" integer, "rent" integer NOT NULL, "rent_all_street" integer, "rent_with_one_house" integer, "rent_with_two_house" integer, "rent_with_three_house" integer, "rent_with_four_house" integer, "rent_with_hotel" integer, "colection_id" uuid, CONSTRAINT "PK_c655590c82e5266ac4aa503d8e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "property_cards" ADD CONSTRAINT "FK_5132ea5f2b1fc903d83422884df" FOREIGN KEY ("colection_id") REFERENCES "colections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "property_cards" DROP CONSTRAINT "FK_5132ea5f2b1fc903d83422884df"`);
        await queryRunner.query(`DROP TABLE "property_cards"`);
    }

}
