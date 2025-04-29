import { MigrationInterface, QueryRunner } from "typeorm";

export class RemakeUserMakeSetingsAndColections1745923850294 implements MigrationInterface {
    name = 'RemakeUserMakeSetingsAndColections1745923850294'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" RENAME COLUMN "owner" TO "owner_id"`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "owner_id"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "owner_id" uuid`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_0631c1eb8316f8af361cf14eb85" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_0631c1eb8316f8af361cf14eb85"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "owner_id"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "owner_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878"`);
        await queryRunner.query(`ALTER TABLE "tasks" RENAME COLUMN "owner_id" TO "owner"`);
    }

}
