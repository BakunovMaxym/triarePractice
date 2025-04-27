import type { MigrationInterface, QueryRunner } from "typeorm";

export class Changepropertypeonenum1745785410601 implements MigrationInterface {
    name = 'Changepropertypeonenum1745785410601'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "property_cards" DROP COLUMN "type"`);
        await queryRunner.query(`CREATE TYPE "public"."property_cards_type_enum" AS ENUM('STANDART', 'FOURTYPE', 'DiCETYP')`);
        await queryRunner.query(`ALTER TABLE "property_cards" ADD "type" "public"."property_cards_type_enum" NOT NULL DEFAULT 'STANDART'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "property_cards" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."property_cards_type_enum"`);
        await queryRunner.query(`ALTER TABLE "property_cards" ADD "type" character varying NOT NULL`);
    }

}
