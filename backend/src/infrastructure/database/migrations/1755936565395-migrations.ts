import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1755936565395 implements MigrationInterface {
    name = 'Migrations1755936565395'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "email" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f2a37d226c4f58242548e53c6b"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "UQ_fbdba4e2ac694cf8c9cecf4dc84" UNIQUE ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_f2a37d226c4f58242548e53c6b" ON "subscriptions" ("userId", "status") `);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f2a37d226c4f58242548e53c6b"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "UQ_fbdba4e2ac694cf8c9cecf4dc84"`);
        await queryRunner.query(`CREATE INDEX "IDX_f2a37d226c4f58242548e53c6b" ON "subscriptions" ("status", "userId") `);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "email"`);
    }

}
