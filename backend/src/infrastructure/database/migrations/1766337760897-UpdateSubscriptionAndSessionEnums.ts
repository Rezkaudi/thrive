import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSubscriptionAndSessionEnums1700000000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // نستخدم IF NOT EXISTS لتجنب الأخطاء إذا كانت القيمة موجودة مسبقاً
        
        // 1. تحديث قائمة الاشتراكات
        await queryRunner.query(`
            ALTER TYPE "public"."subscriptions_subscriptionplan_enum" ADD VALUE IF NOT EXISTS 'standard';
            ALTER TYPE "public"."subscriptions_subscriptionplan_enum" ADD VALUE IF NOT EXISTS 'premium';
        `);

        // 2. تحديث قائمة الجلسات
        await queryRunner.query(`
            ALTER TYPE "public"."sessions_type_enum" ADD VALUE IF NOT EXISTS 'STANDARD';
            ALTER TYPE "public"."sessions_type_enum" ADD VALUE IF NOT EXISTS 'PREMIUM';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Postgres لا يدعم حذف قيم من الـ ENUM بسهولة، لذا نتركها فارغة أو نضع تعليقاً
        // Reverting ENUM values is not directly supported in PostgreSQL without recreating the type.
    }

}