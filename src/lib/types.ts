export type WalletData = {
    address: string;
    balance?: number;
    privateKey?: string;
    encrypted?: Object;
};

export type NewWalletData = {
    privateKey: string,
    address: string,
};
