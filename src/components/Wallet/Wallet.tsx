import React, {useReducer, useCallback} from 'react';
import styles from './Wallet.module.css';

type Props = {
    address: string,
    balance?: number,
    privateKey?: string,
    onShowPrivateKey: (password: string) => void,
    onRequestBalance: () => Promise<void>,
    onHidePrivateKey: () => void,
    error?: string,
};

type State = {
    isPasswordInputVisible: boolean,
    isBalanceLoading: boolean,
    privateKeyError?: string,
    balanceError?: string,
    password: string,
}

const initState: State = {
    isPasswordInputVisible: false,
    isBalanceLoading: false,
    password: '',
};

const texts = {
    passwordPlaceholder: 'PK password',
    hide: 'Hide',
    cancel: 'Cancel',
    show: 'Show',
    showPK: 'Show private key',
    loadBalance: 'Load',
    refreshBalance: 'Refresh',
    formatBalance: (balance: Props['balance']) => `Balance ${balance !== undefined ? balance : 'not loaded yet'}`,
} as const;

const testId = 'Wallet';

export const Wallet = (props: Props) => {
    const {
        address,
        balance,
        privateKey,
        onShowPrivateKey,
        onRequestBalance,
        onHidePrivateKey,
        error,
    } = props;

    const [state, dispatch] =
        useReducer((prevState: State, action: Partial<State>) => ({...prevState, ...action}), initState);

    const handleGetBalance = useCallback(async () => {
        if (state.isBalanceLoading) {
            return;
        }
        dispatch({isBalanceLoading: true});
        await onRequestBalance();
        dispatch({isBalanceLoading: false});
    }, [onRequestBalance, state.isBalanceLoading]);

    const handleShowPasswordInput = useCallback(async () => {
        if (!state.isPasswordInputVisible) {
            dispatch({isPasswordInputVisible: true});
        }
    }, [state.isPasswordInputVisible]);

    const handleShowPrivateKey = useCallback(() => {
        onShowPrivateKey(state.password);
    }, [onShowPrivateKey, state.password])

    const handleHidePrivateKey = useCallback(() => {
        dispatch({password: ''});
        onHidePrivateKey();
    }, [onHidePrivateKey])

    const handleInputPassword = useCallback(() => dispatch({isPasswordInputVisible: false}), [dispatch])
    return (
        <section data-testid={testId} className={styles.wallet}>
            <span className={styles.address}>Address: {address}</span>
            <div className={styles.line}>
                <span className={styles.balance}>{texts.formatBalance(balance)}</span>
                <button onClick={handleGetBalance}>
                    {balance === undefined ? texts.loadBalance : texts.refreshBalance}
                </button>
            </div>
            {privateKey ? (
                <>
                    <span className={styles.privateKey}>{privateKey}</span>
                    <div>
                        <button onClick={handleHidePrivateKey}>{texts.hide}</button>
                    </div>
                </>
            ) : state.isPasswordInputVisible ? (
                <>
                    <div className={styles.line}>
                        <input
                            className={styles.password}
                            type="password"
                            placeholder={texts.passwordPlaceholder}
                            value={state.password}
                            onChange={(e) => dispatch({password: e.target.value})}
                        />
                        <button onClick={handleShowPrivateKey}>{texts.show}</button>
                        <button onClick={handleInputPassword}>{texts.cancel}</button>
                    </div>
                    {error && <span className={styles.error}>{error}</span>}
                </>
            ) : (
                <div className={styles.line}>
                    <button onClick={handleShowPasswordInput}>{texts.showPK}</button>
                </div>
            )}
        </section>
    );
};

Wallet.testId = testId;
Wallet.texts = texts;
