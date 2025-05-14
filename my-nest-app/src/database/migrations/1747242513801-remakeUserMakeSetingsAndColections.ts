import { MigrationInterface, QueryRunner } from "typeorm";

export class RemakeUserMakeSetingsAndColections1747242513801 implements MigrationInterface {
    name = 'RemakeUserMakeSetingsAndColections1747242513801'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "folders" DROP CONSTRAINT "FK_57724e6e07e21c9eb362381781d"`);
        await queryRunner.query(`ALTER TABLE "folders" DROP CONSTRAINT "FK_f8ea81a6b8024b7131df600bb57"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_2b137ebe387f745917904944816"`);
        await queryRunner.query(`CREATE TABLE "subcategories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, "courses_id" uuid, CONSTRAINT "UQ_d1a3a67c9c5d440edf414af1271" UNIQUE ("name"), CONSTRAINT "PK_793ef34ad0a3f86f09d4837007c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "folders" DROP COLUMN "child_folder_id"`);
        await queryRunner.query(`ALTER TABLE "folders" DROP COLUMN "child_course_id"`);
        await queryRunner.query(`ALTER TABLE "folders" ADD "course_ids" uuid array`);
        await queryRunner.query(`ALTER TABLE "folders" ADD "parent_folder_id" uuid`);
        await queryRunner.query(`ALTER TABLE "folders" ADD "owner_id" uuid`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "folder_id" uuid`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "name" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subcategories" ADD CONSTRAINT "FK_c124198df78d0245262a2a6ec1a" FOREIGN KEY ("courses_id") REFERENCES "courses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "folders" ADD CONSTRAINT "FK_4ef163a27ebad84f1171e74dd0c" FOREIGN KEY ("parent_folder_id") REFERENCES "folders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "folders" ADD CONSTRAINT "FK_ecee72de3b100ef0bbebe47f3c4" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_2b137ebe387f745917904944816" FOREIGN KEY ("sub_category_id") REFERENCES "subcategories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_3c3705fcaf954ec45a47501dcc7" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_3c3705fcaf954ec45a47501dcc7"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_2b137ebe387f745917904944816"`);
        await queryRunner.query(`ALTER TABLE "folders" DROP CONSTRAINT "FK_ecee72de3b100ef0bbebe47f3c4"`);
        await queryRunner.query(`ALTER TABLE "folders" DROP CONSTRAINT "FK_4ef163a27ebad84f1171e74dd0c"`);
        await queryRunner.query(`ALTER TABLE "subcategories" DROP CONSTRAINT "FK_c124198df78d0245262a2a6ec1a"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "folder_id"`);
        await queryRunner.query(`ALTER TABLE "folders" DROP COLUMN "owner_id"`);
        await queryRunner.query(`ALTER TABLE "folders" DROP COLUMN "parent_folder_id"`);
        await queryRunner.query(`ALTER TABLE "folders" DROP COLUMN "course_ids"`);
        await queryRunner.query(`ALTER TABLE "folders" ADD "child_course_id" uuid`);
        await queryRunner.query(`ALTER TABLE "folders" ADD "child_folder_id" uuid`);
        await queryRunner.query(`DROP TABLE "subcategories"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_2b137ebe387f745917904944816" FOREIGN KEY ("sub_category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "folders" ADD CONSTRAINT "FK_f8ea81a6b8024b7131df600bb57" FOREIGN KEY ("child_course_id") REFERENCES "courses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "folders" ADD CONSTRAINT "FK_57724e6e07e21c9eb362381781d" FOREIGN KEY ("child_folder_id") REFERENCES "folders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
