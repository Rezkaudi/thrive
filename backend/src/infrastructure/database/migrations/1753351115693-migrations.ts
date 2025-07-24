import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1753351115693 implements MigrationInterface {
    name = 'Migrations1753351115693'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."subscriptions_subscriptionplan_enum" AS ENUM('monthly', 'yearly', 'one-time')`);
        await queryRunner.query(`CREATE TYPE "public"."subscriptions_status_enum" AS ENUM('active', 'canceled', 'past_due', 'unpaid', 'trialing')`);
        await queryRunner.query(`CREATE TABLE "subscriptions" ("id" character varying NOT NULL, "userId" character varying NOT NULL, "stripeCustomerId" character varying NOT NULL, "stripeSubscriptionId" character varying, "stripePaymentIntentId" character varying, "subscriptionPlan" "public"."subscriptions_subscriptionplan_enum" NOT NULL, "status" "public"."subscriptions_status_enum" NOT NULL DEFAULT 'active', "currentPeriodStart" TIMESTAMP NOT NULL, "currentPeriodEnd" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f2a37d226c4f58242548e53c6b" ON "subscriptions" ("userId", "status") `);
        await queryRunner.query(`ALTER TABLE "courses" ADD "freeLessonCount" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "freeLessonCount"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f2a37d226c4f58242548e53c6b"`);
        await queryRunner.query(`DROP TABLE "subscriptions"`);
        await queryRunner.query(`DROP TYPE "public"."subscriptions_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."subscriptions_subscriptionplan_enum"`);
    }

}
