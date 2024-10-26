import { Entity, PrimaryGeneratedColumn, Index, BaseEntity, Column } from 'typeorm';

@Index('superfrensNft_walletId', ['walletId'])
@Entity('SuperfrensNft')
export class SuperfrensNftClaimEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 25, name: 'wallet_id' })
  walletId: string;
  @Column('varchar', { length: 144, name: 'wallet_address' })
  walletAddress: string;
  @Column({ type: 'int', nullable: true })
  index: number;

  @Column({ type: 'float', name: 'native_balance', default: 0 })
  nativeBalance?: number;
  @Column({ type: 'float', name: 'tournament_id' })
  tournamentId: number;
  @Column('varchar', { length: 144, name: 'status' })
  status: string;
  @Column('varchar', { length: 1000, name: 'error', nullable: true })
  error: string | null;
}
