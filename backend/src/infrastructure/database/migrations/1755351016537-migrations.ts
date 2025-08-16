import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1755351016537 implements MigrationInterface {
    name = 'Migrations1755351016537'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "keywords" DROP CONSTRAINT "PK_4aa660a7a585ed828da68f3c28e"`);
        await queryRunner.query(`ALTER TABLE "keywords" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "keywords" ADD "id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "keywords" ADD CONSTRAINT "PK_4aa660a7a585ed828da68f3c28e" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "keywords" ALTER COLUMN "englishSentence" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "keywords" ALTER COLUMN "japaneseSentence" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "progress" ADD CONSTRAINT "FK_df6c728a3df388df34e03d08088" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "progress" ADD CONSTRAINT "FK_cb4d1477194c4ba8cf55bb6eb4b" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "progress" DROP CONSTRAINT "FK_cb4d1477194c4ba8cf55bb6eb4b"`);
        await queryRunner.query(`ALTER TABLE "progress" DROP CONSTRAINT "FK_df6c728a3df388df34e03d08088"`);
        await queryRunner.query(`ALTER TABLE "keywords" ALTER COLUMN "japaneseSentence" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "keywords" ALTER COLUMN "englishSentence" SET DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "keywords" DROP CONSTRAINT "PK_4aa660a7a585ed828da68f3c28e"`);
        await queryRunner.query(`ALTER TABLE "keywords" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "keywords" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "keywords" ADD CONSTRAINT "PK_4aa660a7a585ed828da68f3c28e" PRIMARY KEY ("id")`);
    }

}
