import type { MigrationInterface, QueryRunner } from "typeorm";

export class RemakeTaskStructure1746777092910 implements MigrationInterface {
    name = 'RemakeTaskStructure1746777092910'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_tasks" DROP CONSTRAINT "FK_83e94423ca0675e4ac503d86413"`);
        await queryRunner.query(`ALTER TABLE "user_tasks" DROP CONSTRAINT "FK_eff2f1ef189a7952bc6294a1da5"`);
        await queryRunner.query(`ALTER TABLE "user_tasks" DROP CONSTRAINT "REL_83e94423ca0675e4ac503d8641"`);
        await queryRunner.query(`ALTER TABLE "user_tasks" DROP CONSTRAINT "REL_eff2f1ef189a7952bc6294a1da"`);
        await queryRunner.query(`ALTER TABLE "user_tasks" ADD CONSTRAINT "FK_83e94423ca0675e4ac503d86413" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_tasks" ADD CONSTRAINT "FK_eff2f1ef189a7952bc6294a1da5" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_tasks" DROP CONSTRAINT "FK_eff2f1ef189a7952bc6294a1da5"`);
        await queryRunner.query(`ALTER TABLE "user_tasks" DROP CONSTRAINT "FK_83e94423ca0675e4ac503d86413"`);
        await queryRunner.query(`ALTER TABLE "user_tasks" ADD CONSTRAINT "REL_eff2f1ef189a7952bc6294a1da" UNIQUE ("taskId")`);
        await queryRunner.query(`ALTER TABLE "user_tasks" ADD CONSTRAINT "REL_83e94423ca0675e4ac503d8641" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "user_tasks" ADD CONSTRAINT "FK_eff2f1ef189a7952bc6294a1da5" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_tasks" ADD CONSTRAINT "FK_83e94423ca0675e4ac503d86413" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
