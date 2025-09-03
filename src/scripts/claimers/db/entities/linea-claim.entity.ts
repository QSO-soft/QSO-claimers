import { Entity, PrimaryGeneratedColumn, Index, BaseEntity, Column } from 'typeorm';

@Index('linea_walletAddress', ['walletAddress'])
@Index('linea_status', ['status'])
@Entity('Linea')
export class LineaClaimEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 25, name: 'wallet_id' })
  walletId: string;
  @Column('varchar', { length: 144, name: 'wallet_address' })
  walletAddress: string;
  @Column({ type: 'int', nullable: true })
  index: number;

  @Column('varchar', { length: 25, name: 'network' })
  network: string;
  @Column({ type: 'float', name: 'native_balance', default: 0 })
  nativeBalance?: number;
  @Column('varchar', { length: 144, name: 'status' })
  status: string;
  @Column({ type: 'float', name: 'claim_amount', default: 0 })
  claimAmount?: number;
  @Column({ type: 'float', name: 'balance', default: 0 })
  balance?: number;
  @Column({ type: 'float', name: 'transferred', default: 0 })
  transferred?: number;
  @Column('varchar', { length: 50, name: 'score', default: '' })
  score: string;
  @Column('varchar', { length: 1000, name: 'error', nullable: true })
  error: string | null;
}
