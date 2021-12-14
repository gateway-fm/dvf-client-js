#!/usr/bin/env node

/*
DO NOT EDIT THIS FILE BY HAND!
Examples are generated using helpers/buildExamples.js script.
Check README.md for more details.
*/

const HDWalletProvider = require('@truffle/hdwallet-provider')
const sw = require('starkware_crypto')
const Web3 = require('web3')

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
  useAuthHeader: true
  // Add more variables to override default values
}

;(async () => {
  const dvf = await DVF(web3, dvfConfig)

  let withdrawalId
  const withdrawals = await dvf.getWithdrawals()
  const nonFastWithdrawals = withdrawals.filter(w => !w.fastWithdrawalData)

  if (nonFastWithdrawals.length === 0) {
    console.log('creating a new withdrawal')

    const token = 'ETH'
    const amount = 0.1

    const withdrawalResponse = await dvf.withdraw(
      token,
      amount,
      starkPrivKey
    )

    console.log('withdrawalResponse', withdrawalResponse)
    withdrawalId = withdrawalResponse._id
  } else {
    withdrawalId = nonFastWithdrawals[0]._id
  }

  const canceledWithdrawal = await dvf.cancelWithdrawal(withdrawalId)

  logExampleResult(canceledWithdrawal)

})()
.catch(error => {
  console.error(error)
  process.exit(1)
})

