import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1752575904660 implements MigrationInterface {
    name = 'Migrations1752575904660'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_d35cb3c13a18e1ea1705b2817b1"`);
        await queryRunner.query(`ALTER TABLE "payments" RENAME COLUMN "userId" TO "email"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "UQ_4b8199a55e07d6b4b519e6d90b6" UNIQUE ("email")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "UQ_4b8199a55e07d6b4b519e6d90b6"`);
        await queryRunner.query(`ALTER TABLE "payments" RENAME COLUMN "email" TO "userId"`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_d35cb3c13a18e1ea1705b2817b1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
