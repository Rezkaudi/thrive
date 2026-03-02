import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1772405432218 implements MigrationInterface {
    name = 'Migrations1772405432218'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" RENAME COLUMN "level" TO "levelId"`);
        await queryRunner.query(`CREATE TABLE "levels" ("id" character varying NOT NULL, "name" character varying NOT NULL, "description" text NOT NULL DEFAULT '', "order" integer NOT NULL DEFAULT '1', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_05f8dd8f715793c64d49e3f1901" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "levelId"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "levelId" character varying`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_b0ad433aaeee29ebdf07d314d7b" FOREIGN KEY ("levelId") REFERENCES "levels"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_b0ad433aaeee29ebdf07d314d7b"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "levelId"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "levelId" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`DROP TABLE "levels"`);
        await queryRunner.query(`ALTER TABLE "courses" RENAME COLUMN "levelId" TO "level"`);
    }

}
