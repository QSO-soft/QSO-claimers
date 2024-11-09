import { MigrationInterface, QueryRunner } from 'typeorm';

export class SymbioticPoints1731084171728 implements MigrationInterface {
  name = 'SymbioticPoints1731084171728';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "SymbioticPoints" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "wallet_id" varchar(25) NOT NULL, "wallet_address" varchar(144) NOT NULL, "index" integer, "points" float NOT NULL DEFAULT (0))'
    );
    await queryRunner.query('CREATE INDEX "symbioticPoints_walletId" ON "SymbioticPoints" ("wallet_id") ');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "symbioticPoints_walletId"');
    await queryRunner.query('DROP TABLE "SymbioticPoints"');
  }
}
