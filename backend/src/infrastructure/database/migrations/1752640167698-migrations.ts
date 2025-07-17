import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1752640167698 implements MigrationInterface {
    name = 'Migrations1752640167698'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_d35cb3c13a18e1ea1705b2817b1"`);
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "FK_60dd0ae4e21002e63a5fdefeec8"`);
        await queryRunner.query(`ALTER TABLE "payments" RENAME COLUMN "userId" TO "email"`);
        await queryRunner.query(`ALTER TABLE "lessons" ADD "contentData" jsonb`);
        await queryRunner.query(`ALTER TABLE "lessons" ADD "passingScore" integer`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "UQ_4b8199a55e07d6b4b519e6d90b6" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TYPE "public"."lessons_lessontype_enum" RENAME TO "lessons_lessontype_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."lessons_lessontype_enum" AS ENUM('VIDEO', 'PDF', 'KEYWORDS', 'QUIZ', 'SLIDES')`);
        await queryRunner.query(`ALTER TABLE "lessons" ALTER COLUMN "lessonType" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "lessons" ALTER COLUMN "lessonType" TYPE "public"."lessons_lessontype_enum" USING "lessonType"::"text"::"public"."lessons_lessontype_enum"`);
        await queryRunner.query(`ALTER TABLE "lessons" ALTER COLUMN "lessonType" SET DEFAULT 'VIDEO'`);
        await queryRunner.query(`DROP TYPE "public"."lessons_lessontype_enum_old"`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "FK_60dd0ae4e21002e63a5fdefeec8" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "enrollments" DROP CONSTRAINT "FK_60dd0ae4e21002e63a5fdefeec8"`);
        await queryRunner.query(`CREATE TYPE "public"."lessons_lessontype_enum_old" AS ENUM('VIDEO', 'PDF', 'KEYWORDS')`);
        await queryRunner.query(`ALTER TABLE "lessons" ALTER COLUMN "lessonType" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "lessons" ALTER COLUMN "lessonType" TYPE "public"."lessons_lessontype_enum_old" USING "lessonType"::"text"::"public"."lessons_lessontype_enum_old"`);
        await queryRunner.query(`ALTER TABLE "lessons" ALTER COLUMN "lessonType" SET DEFAULT 'VIDEO'`);
        await queryRunner.query(`DROP TYPE "public"."lessons_lessontype_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."lessons_lessontype_enum_old" RENAME TO "lessons_lessontype_enum"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "UQ_4b8199a55e07d6b4b519e6d90b6"`);
        await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "passingScore"`);
        await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "contentData"`);
        await queryRunner.query(`ALTER TABLE "payments" RENAME COLUMN "email" TO "userId"`);
        await queryRunner.query(`ALTER TABLE "enrollments" ADD CONSTRAINT "FK_60dd0ae4e21002e63a5fdefeec8" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_d35cb3c13a18e1ea1705b2817b1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
