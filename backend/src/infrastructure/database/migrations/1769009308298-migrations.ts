import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1769009308298 implements MigrationInterface {
    name = 'Migrations1769009308298'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."subscriptions_subscriptionplan_enum" RENAME TO "subscriptions_subscriptionplan_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."subscriptions_subscriptionplan_enum" AS ENUM('monthly', 'yearly', 'one-time', 'standard', 'premium')`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ALTER COLUMN "subscriptionPlan" TYPE "public"."subscriptions_subscriptionplan_enum" USING "subscriptionPlan"::"text"::"public"."subscriptions_subscriptionplan_enum"`);
        await queryRunner.query(`DROP TYPE "public"."subscriptions_subscriptionplan_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."sessions_type_enum" RENAME TO "sessions_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."sessions_type_enum" AS ENUM('SPEAKING', 'EVENT', 'STANDARD', 'PREMIUM')`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "type" TYPE "public"."sessions_type_enum" USING "type"::"text"::"public"."sessions_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."sessions_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."sessions_type_enum_old" AS ENUM('SPEAKING', 'EVENT')`);
        await queryRunner.query(`ALTER TABLE "sessions" ALTER COLUMN "type" TYPE "public"."sessions_type_enum_old" USING "type"::"text"::"public"."sessions_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."sessions_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."sessions_type_enum_old" RENAME TO "sessions_type_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."subscriptions_subscriptionplan_enum_old" AS ENUM('monthly', 'yearly', 'one-time')`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ALTER COLUMN "subscriptionPlan" TYPE "public"."subscriptions_subscriptionplan_enum_old" USING "subscriptionPlan"::"text"::"public"."subscriptions_subscriptionplan_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."subscriptions_subscriptionplan_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."subscriptions_subscriptionplan_enum_old" RENAME TO "subscriptions_subscriptionplan_enum"`);
    }

}
