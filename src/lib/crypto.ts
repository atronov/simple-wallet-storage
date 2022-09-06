// original 'web3' doesn't work in browsers
// @ts-ignore
import Web3 from 'web3/dist/web3.min';
import {W3_PROVIDER} from './config';
import {NewWalletData} from './types';

function createW3() {
    return new Web3(Web3.givenProvider || W3_PROVIDER);
}

export const generateNewWallet = (): NewWalletData => {
    const web3 = createW3();
    const account = web3.eth.accounts.create(web3.utils.randomHex(32));
    const {privateKey, address} = account;
    return {
        privateKey,
        address,
    };
};
export const encryptPrivateKey = (password: string, privateKey: string) => {
    const web3 = createW3();
    return web3.eth.accounts.encrypt(privateKey, password);
};

export const decryptPrivateKey = (password: string, encrypted: Object) => {
    const web3 = createW3();
    let decrypted;
    try {
        decrypted = web3.eth.accounts.decrypt(encrypted, password);
    } catch (e) {
        console.error('Error while decryption private key');
        console.error((e instanceof Error) ? (e.stack ?? e.message) : e);
        return undefined;
    }
    const wallet = web3.eth.accounts.wallet.add(decrypted);
    return wallet.privateKey;
};

export const getBalance = async (address: String) => {
    const web3 = createW3();
    return web3.eth.getBalance(address);
};
