import { Hex } from 'viem';

interface AllocationDetail {
  evm: Record<Hex, `${number}`>;
  cosmos: Record<string, `${number}`>;
}

interface Allocation {
  total: `${number}`;
  detail: AllocationDetail;
}

export interface AirdropData {
  evmAddresses: Hex[];
  cosmosAddresses: string[];
  airdropAddress: Hex | '';
  option: '' | 'enhanced' | 'instant';
  allocation: Allocation;
}

// * Connect API response models
export interface ConnectResponse {
  jwtToken: string;
  expiredAt: number | null;
}
