import {useCallback, useState} from 'react';
import {generateNewWallet, encryptPrivateKey} from '../lib/crypto';
import {WalletData} from '../lib/types';

type NewWalletType = ReturnType<typeof generateNewWallet>;

export const useNewWallet = (onCreateNewWallet: (wallet: WalletData) => void) => {
    const [newWallet, setNewWallet] = useState<NewWalletType | undefined>(
        undefined
    );

    const handleSaveNewWallet = useCallback(
        (password: string) => {
            if (!newWallet) {
                return;
            }
            const encryptedNewWallet: WalletData = {
                address: newWallet.address,
                encrypted: encryptPrivateKey(password, newWallet.privateKey),
            };
            setNewWallet(undefined);
            onCreateNewWallet(encryptedNewWallet);
        },
        [newWallet, onCreateNewWallet]
    );

    const handleCreateNewWallet = useCallback(() => {
        setNewWallet(generateNewWallet());
    }, [setNewWallet]);

    const handleCancelNewWallet = useCallback(
        () => setNewWallet(undefined),
        [setNewWallet]
    );

    return {
        handleSaveNewWallet,
        handleCreateNewWallet,
        handleCancelNewWallet,
        newWallet,
    };
};
