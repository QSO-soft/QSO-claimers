import { MigrationInterface, QueryRunner } from 'typeorm';

export class OdosClaimer1734655224846 implements MigrationInterface {
  name = 'OdosClaimer1734655224846';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "Odos" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "wallet_id" varchar(25) NOT NULL, "wallet_address" varchar(144) NOT NULL, "index" integer, "network" varchar(25) NOT NULL, "native_balance" float NOT NULL DEFAULT (0), "status" varchar(144) NOT NULL, "claim_amount" float NOT NULL DEFAULT (0), "balance" float NOT NULL DEFAULT (0), "transferred" float NOT NULL DEFAULT (0), "error" varchar(1000))'
    );
    await queryRunner.query('CREATE INDEX "odos_status" ON "Odos" ("status") ');
    await queryRunner.query('CREATE INDEX "odos_walletId" ON "Odos" ("wallet_id") ');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "odos_walletId"');
    await queryRunner.query('DROP INDEX "odos_status"');
    await queryRunner.query('DROP TABLE "Odos"');
  }
}
