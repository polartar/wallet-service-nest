### How to install project?

    `yarn` or `npm install`

### How to run the project locally?

1. Configure .env variables

   INFURA_API_KEY='Your Infura API Key'

   ETHERSCAN_API_KEY='Your Etherscan API Key'

2. Run the Docker

   If you didn't install the docker, please install it here:
   https://docs.docker.com/engine/install/

3. Run the server

   `npx nx serve rick`

### How to test this project?

1. Create new account
2. Add new wallet to the account
3. Add new account to the wallet (Optional)
4. Check the History table in the database if all transaction histories are added.
5. Generate the transaction through Metamask or any wallet and see if the transaction is added to the History table

\*\* For the Bitcoin balance updates, now mainnet is only available

### APIs

- Create new Account

  `http://localhost:3333/account`

- Add new Wallet to the account

  `http://localhost:3333/wallet/bc1q4u7d6zq2lzwye76mdeytgs6788p9pnceq09jtt`

- Add new address to the wallet

  Coming soon

- Get History

  This will return all transaction history of the wallets of the user

  `http://localhost:3333/wallet/1?period=All`

- Active wallet

  Coming soon
