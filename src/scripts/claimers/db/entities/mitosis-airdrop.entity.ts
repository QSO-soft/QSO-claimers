import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('mitosis_airdrop_walletId', ['walletId'])
@Entity('MitosisAirdrop')
export class MitosisAirdropEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'walletId', type: 'text', default: '' })
  walletId: string;

  @Column({ name: 'walletAddress', type: 'text', default: '' })
  walletAddress: string;

  @Column({ name: 'airdrop_amount', type: 'integer', default: 0 })
  airdropAmount: number;
  @Column({ name: 'airdrop_registered', type: 'boolean', default: false })
  airdropRegistered: boolean;
  @Column({ name: 'airdrop_register_type', type: 'text', default: '' })
  airdropRegisterType: string;
  @Column({ name: 'airdrop_register_address', type: 'text', default: '' })
  airdropRegisterAddress: string;
}
