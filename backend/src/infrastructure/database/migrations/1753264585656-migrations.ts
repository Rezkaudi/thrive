import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1753264585656 implements MigrationInterface {
    name = 'Migrations1753264585656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_47f45eae7c50a0e7c6c36c93b43"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "cancelAtPeriodEnd"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "courseId"`);
        await queryRunner.query(`ALTER TYPE "public"."subscriptions_subscriptionplan_enum" RENAME TO "subscriptions_subscriptionplan_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."subscriptions_subscriptionplan_enum" AS ENUM('monthly', 'yearly', 'one-time')`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ALTER COLUMN "subscriptionPlan" TYPE "public"."subscriptions_subscriptionplan_enum" USING "subscriptionPlan"::"text"::"public"."subscriptions_subscriptionplan_enum"`);
        await queryRunner.query(`DROP TYPE "public"."subscriptions_subscriptionplan_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."subscriptions_subscriptionplan_enum_old" AS ENUM('monthly', 'yearly', 'premiere', 'lifetime')`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ALTER COLUMN "subscriptionPlan" TYPE "public"."subscriptions_subscriptionplan_enum_old" USING "subscriptionPlan"::"text"::"public"."subscriptions_subscriptionplan_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."subscriptions_subscriptionplan_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."subscriptions_subscriptionplan_enum_old" RENAME TO "subscriptions_subscriptionplan_enum"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "courseId" character varying`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "cancelAtPeriodEnd" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_47f45eae7c50a0e7c6c36c93b43" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    }

}
