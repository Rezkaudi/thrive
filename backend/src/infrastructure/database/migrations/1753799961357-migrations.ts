import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1753799961357 implements MigrationInterface {
    name = 'Migrations1753799961357'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "recurringFrequency"`);
        await queryRunner.query(`DROP TYPE "public"."sessions_recurringfrequency_enum"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "recurringGroupId"`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "recurringParentId" character varying`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "recurringWeeks" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "recurringWeeks"`);
        await queryRunner.query(`ALTER TABLE "sessions" DROP COLUMN "recurringParentId"`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "recurringGroupId" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."sessions_recurringfrequency_enum" AS ENUM('weekly', 'biweekly', 'monthly')`);
        await queryRunner.query(`ALTER TABLE "sessions" ADD "recurringFrequency" "public"."sessions_recurringfrequency_enum"`);
    }

}
