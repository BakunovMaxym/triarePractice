import { MigrationInterface, QueryRunner } from "typeorm";

export class RemakeUserMakeSetingsAndColections1746174835491 implements MigrationInterface {
    name = 'RemakeUserMakeSetingsAndColections1746174835491'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878"`);
    }

}
