import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1755351260532 implements MigrationInterface {
    name = 'Migrations1755351260532'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" ADD "order" integer NOT NULL DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "order"`);
    }

}
