import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddTaskFiles1746515627344 implements MigrationInterface {
    name = 'AddTaskFiles1746515627344'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "folders" ADD "child_folder_id" uuid`);
        await queryRunner.query(`ALTER TABLE "folders" ADD "child_course_id" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "last_name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "folders" ADD CONSTRAINT "FK_57724e6e07e21c9eb362381781d" FOREIGN KEY ("child_folder_id") REFERENCES "folders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "folders" ADD CONSTRAINT "FK_f8ea81a6b8024b7131df600bb57" FOREIGN KEY ("child_course_id") REFERENCES "courses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "folders" DROP CONSTRAINT "FK_f8ea81a6b8024b7131df600bb57"`);
        await queryRunner.query(`ALTER TABLE "folders" DROP CONSTRAINT "FK_57724e6e07e21c9eb362381781d"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "last_name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "folders" DROP COLUMN "child_course_id"`);
        await queryRunner.query(`ALTER TABLE "folders" DROP COLUMN "child_folder_id"`);
    }

}
