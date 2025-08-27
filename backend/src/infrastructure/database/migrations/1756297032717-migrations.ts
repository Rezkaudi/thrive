import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1756297032717 implements MigrationInterface {
    name = 'Migrations1756297032717'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "video" DROP COLUMN "title"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "video" ADD "title" character varying NOT NULL`);
    }

}
