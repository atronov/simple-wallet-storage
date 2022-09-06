import {useCallback, useEffect} from 'react';
import {useMap, useList} from 'react-use';
import {decryptPrivateKey, getBalance} from '../lib/crypto';
import {WalletData} from '../lib/types';

type WalletsOptions = {
    restore?: () => WalletData[] | undefined,
    persist?: (data: WalletData[]) => void,
};

export const WRONG_PASSWORD_ERROR_MESSAGE = 'wrong password';

export const useWallets = ({restore, persist}: WalletsOptions = {}) => {
    /**
     * All wallets
     */
    const [wallets, {push: addWallet, updateAt: setWalletAt, set: setWallets}] = useList<WalletData>();
    /**
     * Errors of password inputs
     */
    const [errors, {set: setError, remove: removeError}] = useMap<Record<string, string>>();

    useEffect(() => {
        const wallets = restore && restore();
        if (wallets) {
            setWallets(wallets);
        }
    }, [restore, setWallets]);

    const handleShowPrivateKey = useCallback(
        (i: number, password: string) => {
            const encryptedWallet = wallets[i];
            if (!encryptedWallet || !encryptedWallet.encrypted) {
                return;
            }
            const decryptedPk = decryptPrivateKey(password, encryptedWallet.encrypted);
            if (!decryptedPk) {
                setError(encryptedWallet.address, WRONG_PASSWORD_ERROR_MESSAGE);
                return;
            }
            const newWallet = {
                ...encryptedWallet,
                privateKey: decryptedPk,
            };
            removeError(newWallet.address);
            setWalletAt(i, newWallet);
        },
        [wallets, removeError, setWalletAt, setError],
    );

    const handleShowBalance = useCallback(async (i: number) => {
        const wallet = wallets[i];
        if (!wallet) {
            return;
        }
        const balance = await getBalance(wallet.address);
        const newWallet = {
            ...wallet,
            balance,
        };
        setWalletAt(i, newWallet);
    }, [setWalletAt, wallets]);

    const handleHidePrivateKey = useCallback(
        (i: number) => {
            const wallet = wallets[i];
            if (!wallet) {
                return;
            }
            removeError(wallet.address);
            const newWallet = {...wallet, privateKey: undefined};
            setWalletAt(i, newWallet);
        },
        [removeError, setWalletAt, wallets],
    );

    const handleAddWallet = useCallback(
        (wallet: WalletData) => {
            addWallet(wallet);
            if (persist) {
                persist([...wallets, wallet]);
            }
        },
        [addWallet, persist, wallets],
    );

    return {
        wallets,
        errors,
        handleShowPrivateKey,
        handleHidePrivateKey,
        handleShowBalance,
        handleAddWallet,
    };
};
