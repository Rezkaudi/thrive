import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1770114653490 implements MigrationInterface {
    name = 'Migrations1770114653490'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "marketingEmails" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "marketingEmails"`);
    }

}
