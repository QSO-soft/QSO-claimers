import { Entity, PrimaryGeneratedColumn, Index, BaseEntity, Column } from 'typeorm';

@Index('story_claim_walletId', ['walletId'])
@Entity('StoryClaim')
export class StoryClaimEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', default: 0 })
  amount: number;
  @Column('varchar', { length: 10000, default: '' })
  status: string;

  @Column({ name: 'wallet_address', type: 'varchar', length: 1000 })
  walletAddress: string;
  @Column('varchar', { length: 255 })
  walletId: string;
  @Column({ type: 'int' })
  walletIndex: number;
}
