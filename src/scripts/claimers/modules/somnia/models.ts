// * Eligibility API response models
export interface EligibilityDetail {
  [walletAddress: string]: string;
}

export interface EligibilityResponse {
  total: string;
  detail: EligibilityDetail;
}

// * Wallet auth API response models
export interface User {
  _id: string;
  appId: string;
  identifier: string;
  walletAddresses: string[];
  updatedAt: number;
  createdAt: number;
  extData: {
    firstSignMsgAt: number;
    signMsgMap: {
      [walletAddress: string]: string;
    };
    walletSignature: {
      [walletAddress: string]: string;
    };
    loginWalletName: {
      [walletAddress: string]: string | null;
    };
  };
}

export interface WalletAuthResponse {
  jwtToken: string;
  expiredAt: number;
  user: User;
}

// * Account API response models
export interface AllocationDetail {
  [walletAddress: string]: string;
}

export interface Allocation {
  total: string;
  detail: AllocationDetail;
}

export interface AccountResponse {
  walletAddress: string;
  cexInfo: any | null;
  claimType: string;
  confirmSocialRegistered: boolean;
  allocation: Allocation;
}

// * Connect API response models
export interface ConnectResponse {
  jwtToken: string;
  expiredAt: number | null;
}
