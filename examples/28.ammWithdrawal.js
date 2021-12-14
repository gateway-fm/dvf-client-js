#!/usr/bin/env node

/*
DO NOT EDIT THIS FILE BY HAND!
Examples are generated using helpers/buildExamples.js script.
Check README.md for more details.
*/

const HDWalletProvider = require('@truffle/hdwallet-provider')
const sw = require('starkware_crypto')
const Web3 = require('web3')
const { toBN } = require('dvf-utils')

const DVF = require('../src/dvf')
const envVars = require('./helpers/loadFromEnvOrConfig')(
  process.env.CONFIG_FILE_NAME
)
const logExampleResult = require('./helpers/logExampleResult')(__filename)

const ethPrivKey = envVars.ETH_PRIVATE_KEY
// NOTE: you can also generate a new key using:`
// const starkPrivKey = dvf.stark.createPrivateKey()
const starkPrivKey = envVars.STARK_PRIVATE_KEY
const rpcUrl = envVars.RPC_URL

const provider = new HDWalletProvider(ethPrivKey, rpcUrl)
const web3 = new Web3(provider)
provider.engine.stop()

const dvfConfig = {
  api: envVars.API_URL,
  dataApi: envVars.DATA_API_URL,
  useAuthHeader: true,
  wallet: {
    type: 'tradingKey',
    meta: {
      starkPrivateKey: starkPrivKey
    }
  }
  // Add more variables to override default values
}

;(async () => {
  const dvf = await DVF(web3, dvfConfig)

  const waitForDepositCreditedOnChain = require('./helpers/waitForDepositCreditedOnChain')

  if (process.env.DEPOSIT_FIRST === 'true') {
    const depositETHResponse = await dvf.deposit('KON', 100, starkPrivKey)
    const depositUSDTResponse = await dvf.deposit('DVF', 200, starkPrivKey)
    await waitForDepositCreditedOnChain(dvf, depositETHResponse)
    await waitForDepositCreditedOnChain(dvf, depositUSDTResponse)
  }

  const pool = 'KONDVF'

  const ammFundingOrderData = await dvf.getAmmFundingOrderData({
    pool,
    token: 'KON',
    amount: 100
  })

  const amountLp = toBN(ammFundingOrderData.orders[0].amountBuy).plus(
    toBN(ammFundingOrderData.orders[1].amountBuy)
  )

  const ammWithdrawalOrderData = await dvf.getAmmFundingOrderData({
    pool,
    token: `LP-KONDVF-2`,
    amount: amountLp.toString()
  })

  const ammWithdrawal = await dvf.postAmmFundingOrders(
    ammWithdrawalOrderData
  )

  logExampleResult(ammWithdrawal)

})()
.catch(error => {
  console.error(error)
  process.exit(1)
})

