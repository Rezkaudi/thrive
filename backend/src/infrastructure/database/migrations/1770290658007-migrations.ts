import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1770290658007 implements MigrationInterface {
    name = 'Migrations1770290658007'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "trialStartDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "trialEndDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "trialConvertedToPaid" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "trialConvertedToPaid"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "trialEndDate"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "trialStartDate"`);
    }

}
