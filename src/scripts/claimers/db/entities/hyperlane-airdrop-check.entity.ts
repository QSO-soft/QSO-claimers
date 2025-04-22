import { Entity, PrimaryGeneratedColumn, Index, BaseEntity, Column } from 'typeorm';

@Index('hyperlane-aidrop-check_walletId', ['walletId'])
@Entity('HyperlaneAirdropCheck')
export class HyperlaneAirdropCheckEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', default: 0 })
  amount: number;
  @Column({ type: 'boolean', default: false })
  isEligible: boolean;
  @Column({ type: 'boolean', default: false })
  isRegistered: boolean;
  @Column('varchar', { length: 144, name: 'registration_network', default: '' })
  registrationNetwork: string;
  @Column('varchar', { length: 10, name: 'registration_token', default: '' })
  registrationToken: string;
  @Column('varchar', { length: 144, name: 'registration_receiving_address', default: '' })
  registrationReceivingAddress: string;

  @Column({ type: 'boolean', default: false })
  isClaimed: boolean;

  @Column('varchar', { length: 25, name: 'wallet_id' })
  walletId: string;
  @Column('varchar', { length: 144, name: 'wallet_address' })
  walletAddress: string;
  @Column({ type: 'int', nullable: true })
  index: number;
}
