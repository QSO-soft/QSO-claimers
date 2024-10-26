import { MigrationInterface, QueryRunner } from 'typeorm';

export class SuperformSuperfrensClaimNFT1729980534257 implements MigrationInterface {
  name = 'SuperformSuperfrensClaimNFT1729980534257';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "SuperfrensNft" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "wallet_id" varchar(25) NOT NULL, "wallet_address" varchar(144) NOT NULL, "index" integer, "native_balance" float NOT NULL DEFAULT (0), "tournament_id" float NOT NULL, "status" varchar(144) NOT NULL, "error" varchar(1000))'
    );
    await queryRunner.query('CREATE INDEX "superfrensNft_walletId" ON "SuperfrensNft" ("wallet_id") ');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "superfrensNft_walletId"');
    await queryRunner.query('DROP TABLE "SuperfrensNft"');
  }
}
