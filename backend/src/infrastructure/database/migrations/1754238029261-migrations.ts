import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1754238029261 implements MigrationInterface {
    name = 'Migrations1754238029261'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."recent_activities_activitytype_enum" AS ENUM('USER_REGISTERED', 'LESSON_COMPLETED', 'POST_CREATED', 'SESSION_BOOKED', 'SESSION_ATTENDED', 'COURSE_COMPLETED', 'ACHIEVEMENT_EARNED', 'POINTS_EARNED', 'LEVEL_UP', 'PROFILE_UPDATED')`);
        await queryRunner.query(`CREATE TABLE "recent_activities" ("id" character varying NOT NULL, "userId" character varying NOT NULL, "activityType" "public"."recent_activities_activitytype_enum" NOT NULL, "title" character varying NOT NULL, "description" text, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e01fcee4b30cde25eb0b08fd62f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_248c2ca2f95bcc3c42de0df497" ON "recent_activities" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_b65f6c266d808c17e474b3d0b1" ON "recent_activities" ("userId", "createdAt") `);
        await queryRunner.query(`ALTER TABLE "recent_activities" ADD CONSTRAINT "FK_7e5b29428c999404e4a3e3a2807" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recent_activities" DROP CONSTRAINT "FK_7e5b29428c999404e4a3e3a2807"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b65f6c266d808c17e474b3d0b1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_248c2ca2f95bcc3c42de0df497"`);
        await queryRunner.query(`DROP TABLE "recent_activities"`);
        await queryRunner.query(`DROP TYPE "public"."recent_activities_activitytype_enum"`);
    }

}
