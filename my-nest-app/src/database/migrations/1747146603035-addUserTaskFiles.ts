import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserTaskFiles1747146603035 implements MigrationInterface {
    name = 'AddUserTaskFiles1747146603035'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, "courses_id" uuid, CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "content" text NOT NULL, "owner_id" uuid NOT NULL, "task_id" uuid NOT NULL, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_task_files" ("file_id" character varying NOT NULL, "file_name" character varying NOT NULL, "file_url" character varying NOT NULL, "user_task_id" uuid, CONSTRAINT "PK_b14256e2f51afa25627bf184991" PRIMARY KEY ("file_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_tasks_status_enum" AS ENUM('Призначено', 'Прийнято', 'Здано', 'Протерміновано', 'Здано з запізненням', 'Оцінено', 'Відхилено')`);
        await queryRunner.query(`CREATE TABLE "user_tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."user_tasks_status_enum" NOT NULL DEFAULT 'Призначено', "deadline" TIMESTAMP, "grade" integer, "complete_timestamp" TIMESTAMP, "userId" uuid, "taskId" uuid, CONSTRAINT "PK_dd5ebb5c408af74cba775bd2326" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "task_files" ("file_id" character varying NOT NULL, "file_name" character varying NOT NULL, "file_url" character varying NOT NULL, "task_id" uuid, CONSTRAINT "PK_867bc69a731d3792f60f825cd0c" PRIMARY KEY ("file_id"))`);
        await queryRunner.query(`CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "text_content" character varying, "time_to_complete" bigint, "owner_id" uuid, "course_id" uuid, CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "subcategories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, "courses_id" uuid, CONSTRAINT "UQ_d1a3a67c9c5d440edf414af1271" UNIQUE ("name"), CONSTRAINT "PK_793ef34ad0a3f86f09d4837007c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "folders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" text NOT NULL, "parent_folder_id" uuid, "owner_id" uuid, CONSTRAINT "PK_8578bd31b0e7f6d6c2480dbbca8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "courses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "students_count" integer NOT NULL DEFAULT '0', "teachers_count" integer NOT NULL DEFAULT '0', "owner_id" uuid, "category_id" uuid, "sub_category_id" uuid, "folder_id" uuid, CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('STUDENT', 'TEACHER')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "first_name" character varying, "last_name" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'STUDENT', "email" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "courses_students" ("course_id" uuid NOT NULL, "student_id" uuid NOT NULL, CONSTRAINT "PK_473bdf2ac31c6afe82d00435e14" PRIMARY KEY ("course_id", "student_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_373fad2fd5b550031938f5afe1" ON "courses_students" ("course_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_38ccc15459cb8777aadacbf7dc" ON "courses_students" ("student_id") `);
        await queryRunner.query(`CREATE TABLE "courses_teachers" ("course_id" uuid NOT NULL, "teacher_id" uuid NOT NULL, CONSTRAINT "PK_0fb69ecc0749773da8ca4a5195e" PRIMARY KEY ("course_id", "teacher_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8fc5c9e1a42bfadf1448b55234" ON "courses_teachers" ("course_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_783ba41b48ca81a4a63cd23fd3" ON "courses_teachers" ("teacher_id") `);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_9f2c65ffd89e91844699e741057" FOREIGN KEY ("courses_id") REFERENCES "courses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_d154b3f2f34508a1112a04fc247" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_18c2493067c11f44efb35ca0e03" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_task_files" ADD CONSTRAINT "FK_4293abc0fe671281da6a0a1d8bd" FOREIGN KEY ("user_task_id") REFERENCES "user_tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_tasks" ADD CONSTRAINT "FK_83e94423ca0675e4ac503d86413" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_tasks" ADD CONSTRAINT "FK_eff2f1ef189a7952bc6294a1da5" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_files" ADD CONSTRAINT "FK_e302f4010ff50a1e8199a489090" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_0631c1eb8316f8af361cf14eb85" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_a1146c8fe67a3e4812d89643838" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subcategories" ADD CONSTRAINT "FK_c124198df78d0245262a2a6ec1a" FOREIGN KEY ("courses_id") REFERENCES "courses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "folders" ADD CONSTRAINT "FK_4ef163a27ebad84f1171e74dd0c" FOREIGN KEY ("parent_folder_id") REFERENCES "folders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "folders" ADD CONSTRAINT "FK_ecee72de3b100ef0bbebe47f3c4" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_8e2bcdb457d982b1dc39e5e0edb" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_e4c260fe6bb1131707c4617f745" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_2b137ebe387f745917904944816" FOREIGN KEY ("sub_category_id") REFERENCES "subcategories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_3c3705fcaf954ec45a47501dcc7" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses_students" ADD CONSTRAINT "FK_373fad2fd5b550031938f5afe1f" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "courses_students" ADD CONSTRAINT "FK_38ccc15459cb8777aadacbf7dc1" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses_teachers" ADD CONSTRAINT "FK_8fc5c9e1a42bfadf1448b55234b" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "courses_teachers" ADD CONSTRAINT "FK_783ba41b48ca81a4a63cd23fd39" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses_teachers" DROP CONSTRAINT "FK_783ba41b48ca81a4a63cd23fd39"`);
        await queryRunner.query(`ALTER TABLE "courses_teachers" DROP CONSTRAINT "FK_8fc5c9e1a42bfadf1448b55234b"`);
        await queryRunner.query(`ALTER TABLE "courses_students" DROP CONSTRAINT "FK_38ccc15459cb8777aadacbf7dc1"`);
        await queryRunner.query(`ALTER TABLE "courses_students" DROP CONSTRAINT "FK_373fad2fd5b550031938f5afe1f"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_3c3705fcaf954ec45a47501dcc7"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_2b137ebe387f745917904944816"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_e4c260fe6bb1131707c4617f745"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_8e2bcdb457d982b1dc39e5e0edb"`);
        await queryRunner.query(`ALTER TABLE "folders" DROP CONSTRAINT "FK_ecee72de3b100ef0bbebe47f3c4"`);
        await queryRunner.query(`ALTER TABLE "folders" DROP CONSTRAINT "FK_4ef163a27ebad84f1171e74dd0c"`);
        await queryRunner.query(`ALTER TABLE "subcategories" DROP CONSTRAINT "FK_c124198df78d0245262a2a6ec1a"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_a1146c8fe67a3e4812d89643838"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_0631c1eb8316f8af361cf14eb85"`);
        await queryRunner.query(`ALTER TABLE "task_files" DROP CONSTRAINT "FK_e302f4010ff50a1e8199a489090"`);
        await queryRunner.query(`ALTER TABLE "user_tasks" DROP CONSTRAINT "FK_eff2f1ef189a7952bc6294a1da5"`);
        await queryRunner.query(`ALTER TABLE "user_tasks" DROP CONSTRAINT "FK_83e94423ca0675e4ac503d86413"`);
        await queryRunner.query(`ALTER TABLE "user_task_files" DROP CONSTRAINT "FK_4293abc0fe671281da6a0a1d8bd"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_18c2493067c11f44efb35ca0e03"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_d154b3f2f34508a1112a04fc247"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_9f2c65ffd89e91844699e741057"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_783ba41b48ca81a4a63cd23fd3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8fc5c9e1a42bfadf1448b55234"`);
        await queryRunner.query(`DROP TABLE "courses_teachers"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_38ccc15459cb8777aadacbf7dc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_373fad2fd5b550031938f5afe1"`);
        await queryRunner.query(`DROP TABLE "courses_students"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "courses"`);
        await queryRunner.query(`DROP TABLE "folders"`);
        await queryRunner.query(`DROP TABLE "subcategories"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`DROP TABLE "task_files"`);
        await queryRunner.query(`DROP TABLE "user_tasks"`);
        await queryRunner.query(`DROP TYPE "public"."user_tasks_status_enum"`);
        await queryRunner.query(`DROP TABLE "user_task_files"`);
        await queryRunner.query(`DROP TABLE "comments"`);
        await queryRunner.query(`DROP TABLE "categories"`);
    }

}
