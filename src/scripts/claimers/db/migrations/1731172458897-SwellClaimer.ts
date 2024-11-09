import { MigrationInterface, QueryRunner } from 'typeorm';

export class SwellClaimer1731172458897 implements MigrationInterface {
  name = 'SwellClaimer1731172458897';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "Swell" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "wallet_id" varchar(25) NOT NULL, "wallet_address" varchar(144) NOT NULL, "index" integer, "network" varchar(25) NOT NULL, "native_balance" float NOT NULL DEFAULT (0), "status" varchar(144) NOT NULL, "claim_amount" float NOT NULL DEFAULT (0), "balance" float NOT NULL DEFAULT (0), "transferred" float NOT NULL DEFAULT (0), "isSybil" boolean NOT NULL DEFAULT (0), "error" varchar(1000))'
    );
    await queryRunner.query('CREATE INDEX "swell_status" ON "Swell" ("status") ');
    await queryRunner.query('CREATE INDEX "swell_walletId" ON "Swell" ("wallet_id") ');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "swell_walletId"');
    await queryRunner.query('DROP INDEX "swell_status"');
    await queryRunner.query('DROP TABLE "Swell"');
  }
}
