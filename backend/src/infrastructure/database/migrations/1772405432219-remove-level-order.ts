import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveLevelOrder1772405432219 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "levels" DROP COLUMN IF EXISTS "order"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "levels" ADD COLUMN "order" integer NOT NULL DEFAULT 1`);
  }
}
