import { DataSource, DeepPartial, EntityTarget, ObjectLiteral, Repository } from 'typeorm';

import { WalletData } from '../types';

interface EntityManagerOptions<T extends ObjectLiteral> {
  dbSource: DataSource;
  entityClass: EntityTarget<T>;
  wallet: WalletData;
  statisticCallback?: (dbSource: DataSource) => Promise<void>;
  isSolana?: boolean;
}

export class EntityManager<T extends ObjectLiteral> {
  private readonly repository: Repository<T>;
  private readonly statisticCallback?: (dbSource: DataSource) => Promise<void>;
  private readonly dbSource: DataSource;
  private readonly isSolana: boolean;

  private localEntity: T | null = null;
  private wallet: WalletData;

  constructor(options: EntityManagerOptions<T>) {
    this.repository = options.dbSource.getRepository(options.entityClass);
    this.statisticCallback = options.statisticCallback;
    this.wallet = options.wallet;
    this.dbSource = options.dbSource;
    this.isSolana = options.isSolana || false;
  }

  /**
   * Get entity from DB or create new one
   */
  async getAccountInfo(additionalData: Partial<T> = {}): Promise<T> {
    // * Try to find existing record
    let entity = await this.repository.findOne({
      where: { walletId: this.wallet.id } as any,
    });

    // * Create new record if not found
    if (!entity) {
      const entityData: DeepPartial<T> = {
        walletId: this.wallet.id,
        walletAddress: this.wallet.walletAddress,
        ...additionalData,
      } as any;

      const savedEntity = await this.repository.save(entityData);
      entity = savedEntity as T;
    }

    // * Save reference to local entity
    this.localEntity = entity;
    return entity;
  }

  /**
   * Update entity in DB and local reference
   */
  async updateAccountInfo(data: Partial<T>, triggerStatisticUnload = false): Promise<T> {
    // * Get current info if local reference is missing
    if (!this.localEntity) {
      this.localEntity = await this.getAccountInfo();
    }

    // * Check if there are any changes
    const hasChanges = Object.keys(data).some((key) => {
      const k = key as keyof T;
      return this.localEntity![k] !== data[k];
    });

    // * If there are changes - update
    const triggerUnload = triggerStatisticUnload && this.statisticCallback;
    if (hasChanges || triggerUnload) {
      await this.repository.update({ id: (this.localEntity as any).id }, data as any);

      // * Execute callback for statistics if flag is passed and function exists
      if (triggerUnload) {
        await this.statisticCallback(this.dbSource);
      }

      // * Update local reference
      Object.assign(this.localEntity, data);
    }

    return this.localEntity;
  }

  /**
   * Get current local entity
   */
  getCurrentAccountInfo(): T | null {
    return this.localEntity;
  }

  /**
   * Set local reference to entity
   */
  setCurrentAccountInfo(entity: T): void {
    this.localEntity = entity;
  }

  /**
   * Get repository for additional operations
   */
  getRepository(): Repository<T> {
    return this.repository;
  }
}
