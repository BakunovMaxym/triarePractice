import type { MigrationInterface, QueryRunner } from "typeorm";

export class RemakeUserMakeSetingsAndColections1745910488342 implements MigrationInterface {
    name = 'RemakeUserMakeSetingsAndColections1745910488342'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses_students" DROP CONSTRAINT "FK_38ccc15459cb8777aadacbf7dc1"`);
        await queryRunner.query(`ALTER TABLE "courses_teachers" DROP CONSTRAINT "FK_783ba41b48ca81a4a63cd23fd39"`);
        await queryRunner.query(`CREATE TABLE "tasks" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "content" text NOT NULL, "state" character varying NOT NULL, "owner" character varying NOT NULL, "course_id" uuid, CONSTRAINT "UQ_396d500ff7f1b82771ddd812fd1" UNIQUE ("name"), CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "sub_category_id" uuid`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_a1146c8fe67a3e4812d89643838" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_2b137ebe387f745917904944816" FOREIGN KEY ("sub_category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses_students" ADD CONSTRAINT "FK_38ccc15459cb8777aadacbf7dc1" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses_teachers" ADD CONSTRAINT "FK_783ba41b48ca81a4a63cd23fd39" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses_teachers" DROP CONSTRAINT "FK_783ba41b48ca81a4a63cd23fd39"`);
        await queryRunner.query(`ALTER TABLE "courses_students" DROP CONSTRAINT "FK_38ccc15459cb8777aadacbf7dc1"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_2b137ebe387f745917904944816"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_a1146c8fe67a3e4812d89643838"`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "sub_category_id"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`ALTER TABLE "courses_teachers" ADD CONSTRAINT "FK_783ba41b48ca81a4a63cd23fd39" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "courses_students" ADD CONSTRAINT "FK_38ccc15459cb8777aadacbf7dc1" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
