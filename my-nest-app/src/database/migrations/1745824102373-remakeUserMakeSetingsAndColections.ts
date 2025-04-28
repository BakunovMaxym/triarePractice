import { MigrationInterface, QueryRunner } from "typeorm";

export class RemakeUserMakeSetingsAndColections1745824102373 implements MigrationInterface {
    name = 'RemakeUserMakeSetingsAndColections1745824102373'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_c4f9a7bd77b489e711277ee5986"`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, "courses_id" uuid, CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "courses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "owner_id" uuid, "category_id" uuid, CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "courses_students" ("course_id" uuid NOT NULL, "student_id" uuid NOT NULL, CONSTRAINT "PK_473bdf2ac31c6afe82d00435e14" PRIMARY KEY ("course_id", "student_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_373fad2fd5b550031938f5afe1" ON "courses_students" ("course_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_38ccc15459cb8777aadacbf7dc" ON "courses_students" ("student_id") `);
        await queryRunner.query(`CREATE TABLE "courses_teachers" ("course_id" uuid NOT NULL, "teacher_id" uuid NOT NULL, CONSTRAINT "PK_0fb69ecc0749773da8ca4a5195e" PRIMARY KEY ("course_id", "teacher_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8fc5c9e1a42bfadf1448b55234" ON "courses_teachers" ("course_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_783ba41b48ca81a4a63cd23fd3" ON "courses_teachers" ("teacher_id") `);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_9f2c65ffd89e91844699e741057" FOREIGN KEY ("courses_id") REFERENCES "courses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_8e2bcdb457d982b1dc39e5e0edb" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_e4c260fe6bb1131707c4617f745" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses_students" ADD CONSTRAINT "FK_373fad2fd5b550031938f5afe1f" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "courses_students" ADD CONSTRAINT "FK_38ccc15459cb8777aadacbf7dc1" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "courses_teachers" ADD CONSTRAINT "FK_8fc5c9e1a42bfadf1448b55234b" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "courses_teachers" ADD CONSTRAINT "FK_783ba41b48ca81a4a63cd23fd39" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses_teachers" DROP CONSTRAINT "FK_783ba41b48ca81a4a63cd23fd39"`);
        await queryRunner.query(`ALTER TABLE "courses_teachers" DROP CONSTRAINT "FK_8fc5c9e1a42bfadf1448b55234b"`);
        await queryRunner.query(`ALTER TABLE "courses_students" DROP CONSTRAINT "FK_38ccc15459cb8777aadacbf7dc1"`);
        await queryRunner.query(`ALTER TABLE "courses_students" DROP CONSTRAINT "FK_373fad2fd5b550031938f5afe1f"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_e4c260fe6bb1131707c4617f745"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_8e2bcdb457d982b1dc39e5e0edb"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_9f2c65ffd89e91844699e741057"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_783ba41b48ca81a4a63cd23fd3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8fc5c9e1a42bfadf1448b55234"`);
        await queryRunner.query(`DROP TABLE "courses_teachers"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_38ccc15459cb8777aadacbf7dc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_373fad2fd5b550031938f5afe1"`);
        await queryRunner.query(`DROP TABLE "courses_students"`);
        await queryRunner.query(`DROP TABLE "courses"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_c4f9a7bd77b489e711277ee5986" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
