# Simple wallet storage

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Details

This is a simple web-app to generate, check balance, keep crypto wallets.

It works via web3js. The logic, related to web3, is encapsulated at `src/lib/crypto.ts`. And it's mocked in tests.

It doesn't use Redux because, it's too much boilerplate code to operate with state here.

To clear persisted wallets, clear your browser's localStorage. The app doesn't support deletion.

To let balance check work you need run the app in browser with MetaMask or connect your own node changing `W3_PROVIDER` at the config `src/lib/crypto.ts`.
