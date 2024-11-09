import { Entity, PrimaryGeneratedColumn, Index, BaseEntity, Column } from 'typeorm';

@Index('symbioticPoints_walletId', ['walletId'])
@Entity('SymbioticPoints')
export class SymbioticPointsEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 25, name: 'wallet_id' })
  walletId: string;
  @Column('varchar', { length: 144, name: 'wallet_address' })
  walletAddress: string;
  @Column({ type: 'int', nullable: true })
  index: number;

  @Column({ type: 'float', default: 0 })
  points: number;
}
