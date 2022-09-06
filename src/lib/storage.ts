import {LOCAL_STORAGE_KEY} from './config';
import {WalletData} from './types';

export function persist(wallets: WalletData[]) {
    const rawDataToPersist: WalletData[] = wallets.map(wallet => ({
        address: wallet.address,
        encrypted: wallet.encrypted,
    }))
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rawDataToPersist));
}

export function restore(): WalletData[] | undefined {
    const rawData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (rawData === null) {
        return undefined;
    }
    return JSON.parse(rawData) as WalletData[];
}
