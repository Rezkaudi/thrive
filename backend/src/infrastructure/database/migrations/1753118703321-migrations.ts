import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1753118703321 implements MigrationInterface {
    name = 'Migrations1753118703321'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "isverify" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "verificationCode" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "exprirat" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "exprirat"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "verificationCode"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isverify"`);
    }

}
