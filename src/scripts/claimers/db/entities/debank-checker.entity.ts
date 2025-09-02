import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('debank_checker_walletId', ['walletId'])
@Entity('DebankChecker')
export class DebankCheckerEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'walletId', type: 'text', default: '' })
  walletId: string;

  @Column({ name: 'walletAddress', type: 'text', default: '' })
  walletAddress: string;

  @Column({ type: 'int', default: 0, name: 'age' })
  age: number;

  @Column({ type: 'int', default: 0, name: 'rank' })
  rank: number;

  @Column({ type: 'text', default: '', name: 'total_value_usd' })
  totalValueUSD: string;

  @Column({ type: 'text', default: '', name: 'last_updated_at' })
  lastUpdatedAt: string;

  @Column({ type: 'text', default: '{}', name: 'balances' })
  balances: string;

  @Column({ type: 'text', default: '{}', name: 'balances_usd' })
  balances_usd: string;

  @Column({ type: 'text', default: '{}', name: 'chain_balances' })
  chainBalances: string;

  @Column({ type: 'text', default: '{}', name: 'protocol_balances' })
  protocolBalances: string;
}
