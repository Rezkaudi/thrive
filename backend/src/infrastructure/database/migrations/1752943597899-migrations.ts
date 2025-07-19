import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1752943597899 implements MigrationInterface {
    name = 'Migrations1752943597899'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "UQ_4b8199a55e07d6b4b519e6d90b6"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "UQ_4b8199a55e07d6b4b519e6d90b6" UNIQUE ("email")`);
    }

}
