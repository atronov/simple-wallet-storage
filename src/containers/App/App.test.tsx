/* eslint-disable testing-library/prefer-screen-queries */
import React from 'react';
import {render, screen, fireEvent, getByText, waitFor, getByPlaceholderText} from '@testing-library/react';
import {NewWallet} from '../../components/NewWallet/NewWallet';
import {Wallet} from '../../components/Wallet/Wallet';
import {WRONG_PASSWORD_ERROR_MESSAGE} from '../../hooks/useWallets';
import {WalletData} from '../../lib/types';
import {App} from './App';
import {generateNewWallet, encryptPrivateKey, decryptPrivateKey, getBalance} from '../../lib/crypto';

jest.mock('../../lib/crypto', () => {
    return {
        __esModule: true,
        generateNewWallet: jest.fn(),
        decryptPrivateKey: jest.fn(),
        encryptPrivateKey: jest.fn(),
        getBalance: jest.fn(),
    };
});

const persistedWallets: WalletData[] = [
    {address: 'address-1', encrypted: 'encrypted-key-1'},
    {address: 'address-2', encrypted: 'encrypted-key-2'},
    {address: 'address-3', encrypted: 'encrypted-key-3'},
];

let lastGeneratedWallet: WalletData;

const rightPassword = '12345';
const privateKeyToDecrypt = 'private-key-' + Math.random();

beforeEach(() => {
    // @ts-ignore
    generateNewWallet.mockImplementation(() => {
        const privateKey = 'private-key-' + Math.random();
        const address = 'address-' + Math.random();
        const newWallet = {
            privateKey,
            address,
        };
        lastGeneratedWallet = newWallet;
        return newWallet;
    });
    // @ts-ignore
    encryptPrivateKey.mockReturnValue({
        thisIsEncrypted: true,
    });
    // @ts-ignore
    decryptPrivateKey.mockImplementation((password: string) =>
        password === rightPassword ? privateKeyToDecrypt : undefined,
    );
});


function userCreatesNewWallet(password: string = rightPassword) {
    fireEvent.click(screen.getByText(App.texts.generateNew));
    fireEvent.change(screen.getByPlaceholderText(NewWallet.texts.passwordPlaceholder), {target: {value: password}});
    fireEvent.click(screen.getByText(NewWallet.texts.createButton));
}

function userTriesToShowPrivateKey(password: string = rightPassword) {
    const walletElement = screen.getAllByTestId(Wallet.testId)[0];
    fireEvent.click(getByText(walletElement, Wallet.texts.showPK));
    const passwordInput = getByPlaceholderText(walletElement, Wallet.texts.passwordPlaceholder);
    fireEvent.input(passwordInput, {target: {value: password}});
    fireEvent.click(getByText(walletElement, Wallet.texts.show));
    return walletElement;
}

afterEach(() => {
    jest.resetAllMocks();
});

test('generate new wallets from scratch', () => {
    render(<App />);

    userCreatesNewWallet();

    expect(generateNewWallet).toBeCalledTimes(1);
    expect(encryptPrivateKey).toBeCalledTimes(1);
    expect(encryptPrivateKey).toBeCalledWith(rightPassword, lastGeneratedWallet.privateKey);
    expect(screen.getByTestId(Wallet.testId)).toBeInTheDocument();
    expect(screen.getByTestId(Wallet.testId)).not.toHaveTextContent(lastGeneratedWallet?.privateKey ?? '');
    expect(screen.queryByTestId(NewWallet.testId)).not.toBeInTheDocument();
});

test('persist wallets without private key', () => {
    const persisted: string[] = [];
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation((_, data) => persisted.push(data));
    render(<App />);

    const newWalletsNumber = 3;
    Array.from({length: newWalletsNumber}).forEach(() => {
        userCreatesNewWallet();
    });

    expect(persisted).toHaveLength(newWalletsNumber);
    const lastPersisted = persisted[persisted.length - 1];
    (JSON.parse(lastPersisted) as WalletData[]).forEach((wallet) => {
        expect(wallet).toHaveProperty('encrypted');
        expect(wallet).not.toHaveProperty('privateKey');
    });
});

test('restore persisted wallets', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((_) => JSON.stringify(persistedWallets));
    render(<App />);
    const walletElements = screen.getAllByTestId(Wallet.testId);
    expect(walletElements).toHaveLength(persistedWallets.length);
    walletElements.forEach((walletElement, i) => {
        expect(walletElement).toHaveTextContent(persistedWallets[i].address);
    });
});

test('add new wallets to already persisted list', () => {
    let newPersistedWallets: WalletData[] = [];
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((_) => JSON.stringify(persistedWallets));
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation((_, data) => (newPersistedWallets = JSON.parse(data)));

    render(<App />);

    userCreatesNewWallet();

    const expectedCount = persistedWallets.length + 1;
    expect(newPersistedWallets).toHaveLength(expectedCount);
    const walletElements = screen.getAllByTestId(Wallet.testId);
    expect(walletElements).toHaveLength(expectedCount);
    walletElements.forEach((walletElement, i) => {
        expect(walletElement).toHaveTextContent(newPersistedWallets[i].address);
    });
});

test('request balance', async () => {
    const mockedBalance = 12345.56;
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((_) => JSON.stringify(persistedWallets));
    // @ts-ignore
    getBalance.mockReturnValue(Promise.resolve(mockedBalance));
    render(<App />);
    const walletElements = screen.getAllByTestId(Wallet.testId);
    fireEvent.click(getByText(walletElements[0], Wallet.texts.loadBalance));
    await waitFor(() => expect(walletElements[0]).toHaveTextContent(Wallet.texts.formatBalance(mockedBalance)));
});

test('see private key with password', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((_) => JSON.stringify(persistedWallets));
    render(<App />);
    const walletElement = userTriesToShowPrivateKey();
    expect(walletElement).toHaveTextContent(privateKeyToDecrypt);
});

test('impossible to see private key with wrong password', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((_) => JSON.stringify(persistedWallets));
    render(<App />);
    const wrongPassword = '54321';
    const walletElement = userTriesToShowPrivateKey(wrongPassword);
    expect(walletElement).not.toHaveTextContent(privateKeyToDecrypt);
    expect(walletElement).toHaveTextContent(WRONG_PASSWORD_ERROR_MESSAGE);
});

test('hide private key', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((_) => JSON.stringify(persistedWallets));
    render(<App />);
    const walletElement = userTriesToShowPrivateKey();
    fireEvent.click(getByText(walletElement, Wallet.texts.hide));
    expect(walletElement).not.toHaveTextContent(privateKeyToDecrypt);
});
