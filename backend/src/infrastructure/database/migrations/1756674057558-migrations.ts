import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1756674057558 implements MigrationInterface {
    name = 'Migrations1756674057558'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "feedback_likes" ("id" character varying NOT NULL, "userId" character varying NOT NULL, "feedbackId" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_092061985921001623c5157bb71" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "feedback_likes" ADD CONSTRAINT "FK_3b55efce420c5029a67d0f80a7a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "feedback_likes" ADD CONSTRAINT "FK_2be52f77fa6bc4eeddfb8bdc3b5" FOREIGN KEY ("feedbackId") REFERENCES "feedbacks"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "feedback_likes" DROP CONSTRAINT "FK_2be52f77fa6bc4eeddfb8bdc3b5"`);
        await queryRunner.query(`ALTER TABLE "feedback_likes" DROP CONSTRAINT "FK_3b55efce420c5029a67d0f80a7a"`);
        await queryRunner.query(`DROP TABLE "feedback_likes"`);
    }

}
