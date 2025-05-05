import { MigrationInterface, QueryRunner } from "typeorm";

export class UdateUsers1746180616010 implements MigrationInterface {
    name = 'UdateUsers1746180616010'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "UQ_396d500ff7f1b82771ddd812fd1"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "UQ_396d500ff7f1b82771ddd812fd1" UNIQUE ("name")`);
    }

}
