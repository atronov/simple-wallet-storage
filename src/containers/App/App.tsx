import {NewWallet} from '../../components/NewWallet/NewWallet';
import {Wallet} from '../../components/Wallet/Wallet';
import {persist, restore} from '../../lib/storage';
import {useNewWallet} from '../../hooks/useNewWallet';
import {useWallets} from '../../hooks/useWallets';
import styles from './App.module.css';

const texts = {
    generateNew: 'Generate new wallet',
};

export function App() {
    const {wallets, errors, handleShowPrivateKey, handleHidePrivateKey, handleAddWallet, handleShowBalance} =
        useWallets({
            persist,
            restore,
        });

    const {handleCancelNewWallet, handleCreateNewWallet, handleSaveNewWallet, newWallet} =
        useNewWallet(handleAddWallet);

    return (
        <main className={styles.app}>
            {wallets.map((wallet, i) => (
                <Wallet
                    key={wallet.address}
                    address={wallet.address}
                    privateKey={wallet.privateKey}
                    balance={wallet.balance}
                    error={errors[wallet.address]}
                    onRequestBalance={() => handleShowBalance(i)}
                    onShowPrivateKey={(password) => handleShowPrivateKey(i, password)}
                    onHidePrivateKey={() => handleHidePrivateKey(i)}
                />
            ))}
            {newWallet ? (
                <NewWallet
                    address={newWallet.address}
                    privateKey={newWallet.privateKey}
                    onCreate={handleSaveNewWallet}
                    onCancel={handleCancelNewWallet}
                />
            ) : (
                <div>
                    <button onClick={handleCreateNewWallet}>Generate new wallet</button>
                </div>
            )}
        </main>
    );
}

App.texts = texts;
