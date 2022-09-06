import React, {useState, useCallback} from 'react';
import styles from './NewWallet.module.css';

type Props = {
    address: string;
    privateKey: string;
    onCreate: (password: string) => void;
    onCancel: () => void;
};

const texts = {
    passwordPlaceholder: 'PK password',
    createButton: 'Create',
    cancelButton: 'Cancel',
} as const;

const testId = 'NewWallet';

export const NewWallet = ({onCreate, onCancel, address}: Props) => {
    const [password, setPassword] = useState('');
    const handleCreate = useCallback(() => onCreate(password), [onCreate, password]);
    const handleCancel = useCallback(() => {
        setPassword('');
        onCancel();
    }, [onCancel]);
    return (
        <section className={styles.newWallet} data-testid={testId}>
            <span className={styles.address}>Address: {address}</span>
            <span>Enter password to finish creation:</span>
            <div className={styles.line}>
                <input
                    className={styles.password}
                    type="password"
                    placeholder={texts.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button onClick={handleCreate}>{texts.createButton}</button>
                <button onClick={handleCancel}>{texts.cancelButton}</button>
            </div>
        </section>
    );
};

NewWallet.texts = texts;
NewWallet.testId = testId;
