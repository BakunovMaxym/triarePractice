import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddPropertyAndUpdateUser1745832137285 implements MigrationInterface {
    name = 'AddPropertyAndUpdateUser1745832137285'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."propertys_property_type_enum" AS ENUM('normal', 'mortgage')`);
        await queryRunner.query(`CREATE TABLE "propertys" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "property_type" "public"."propertys_property_type_enum" NOT NULL DEFAULT 'normal', "upgrade_count" integer NOT NULL, "property_id" uuid, "owner_id" uuid, CONSTRAINT "PK_ca3c53f8120ed1a19c8444123f8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "propertys" ADD CONSTRAINT "FK_a134d7afb80af5cf4ecb68842fb" FOREIGN KEY ("property_id") REFERENCES "property_cards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "propertys" ADD CONSTRAINT "FK_a73787b4d53011e8dc6eeb4470d" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "propertys" DROP CONSTRAINT "FK_a73787b4d53011e8dc6eeb4470d"`);
        await queryRunner.query(`ALTER TABLE "propertys" DROP CONSTRAINT "FK_a134d7afb80af5cf4ecb68842fb"`);
        await queryRunner.query(`DROP TABLE "propertys"`);
        await queryRunner.query(`DROP TYPE "public"."propertys_property_type_enum"`);
    }

}
