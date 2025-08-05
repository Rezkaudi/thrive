import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1754416613522 implements MigrationInterface {
    name = 'Migrations1754416613522'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "progress" ("id" character varying NOT NULL, "userId" character varying NOT NULL, "lessonId" character varying NOT NULL, "courseId" character varying NOT NULL, "isCompleted" boolean NOT NULL DEFAULT false, "completedAt" TIMESTAMP, "reflectionSubmitted" boolean, "quizScore" double precision, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_79abdfd87a688f9de756a162b6f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "progress" ADD CONSTRAINT "FK_0366c96237f98ea1c8ba6e1ec35" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "progress" ADD CONSTRAINT "FK_df6c728a3df388df34e03d08088" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "progress" ADD CONSTRAINT "FK_cb4d1477194c4ba8cf55bb6eb4b" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "progress" DROP CONSTRAINT "FK_cb4d1477194c4ba8cf55bb6eb4b"`);
        await queryRunner.query(`ALTER TABLE "progress" DROP CONSTRAINT "FK_df6c728a3df388df34e03d08088"`);
        await queryRunner.query(`ALTER TABLE "progress" DROP CONSTRAINT "FK_0366c96237f98ea1c8ba6e1ec35"`);
        await queryRunner.query(`DROP TABLE "progress"`);
    }

}
