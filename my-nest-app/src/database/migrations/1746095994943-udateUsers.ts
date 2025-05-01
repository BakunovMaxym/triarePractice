import type { MigrationInterface, QueryRunner } from "typeorm";

export class UdateUsers1746095994943 implements MigrationInterface {
    name = 'UdateUsers1746095994943'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "content" text NOT NULL, "owner_id" uuid NOT NULL, "task_id" uuid NOT NULL, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_tasks_status_enum" AS ENUM('Призначено', 'Прийнято', 'Здано', 'Протерміновано', 'Здано з запізненням', 'Оцінено', 'Відхилено')`);
        await queryRunner.query(`CREATE TABLE "user_tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."user_tasks_status_enum" NOT NULL DEFAULT 'Призначено', "deadline" TIMESTAMP, "complete_timestamp" TIMESTAMP, "userId" uuid, "taskId" uuid, CONSTRAINT "PK_dd5ebb5c408af74cba775bd2326" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "folders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" text NOT NULL, CONSTRAINT "PK_8578bd31b0e7f6d6c2480dbbca8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "content"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "state"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "text_content" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "file_content" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "students_count" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "teachers_count" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878"`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_d154b3f2f34508a1112a04fc247" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_18c2493067c11f44efb35ca0e03" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_tasks" ADD CONSTRAINT "FK_83e94423ca0675e4ac503d86413" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_tasks" ADD CONSTRAINT "FK_eff2f1ef189a7952bc6294a1da5" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_tasks" DROP CONSTRAINT "FK_eff2f1ef189a7952bc6294a1da5"`);
        await queryRunner.query(`ALTER TABLE "user_tasks" DROP CONSTRAINT "FK_83e94423ca0675e4ac503d86413"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_18c2493067c11f44efb35ca0e03"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_d154b3f2f34508a1112a04fc247"`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "teachers_count"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "students_count"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "file_content"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "text_content"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "state" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "content" text NOT NULL`);
        await queryRunner.query(`DROP TABLE "folders"`);
        await queryRunner.query(`DROP TABLE "user_tasks"`);
        await queryRunner.query(`DROP TYPE "public"."user_tasks_status_enum"`);
        await queryRunner.query(`DROP TABLE "comments"`);
    }

}
