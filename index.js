#!/usr/bin/env node
'use strict';

require('colors')

// initial investment!
// all subsequent investment will be from gains
let walletBalance = 10000 
let tradeBalance = 0

let totalTax = 0

const GAIN = 0.3
const TAX = 0.3
const NO_REINVEST_RATIO = .6

// always invest half
// deduct transfer cost 50 USDT later
const invest = () => {
  const toInvest = walletBalance / 2 // initial investment ratio
  walletBalance -= toInvest
  tradeBalance += toInvest
}

// 30% for now
const trade = () => {
  const oldTradeBalance = tradeBalance
  tradeBalance = tradeBalance * (1 + GAIN)
  console.log(`Traded ${oldTradeBalance} -> ${tradeBalance} ${tradeBalance / oldTradeBalance * 100 - 100}%`.cyan)
}

const settle = () => {
  // send tax on gain to exhange
  const taxPaid = tradeBalance / (1 + GAIN) * GAIN * TAX
  console.log(`${TAX*100}% Tax paid ${taxPaid}`.red)
  walletBalance -= taxPaid
  totalTax += taxPaid
  // move out part of profit to wallet
  const moveOut = tradeBalance / (1 + GAIN) * (GAIN * NO_REINVEST_RATIO)
  walletBalance += moveOut
  tradeBalance -= moveOut
}

const printStatus = () => 
  console.log(`wallet ${walletBalance}      tradeBalance ${tradeBalance} \n\n`.green)

printStatus()

invest()

let tradeCount = 0

while (walletBalance + tradeBalance < 100000) {

  trade()

  settle()

  printStatus()

  tradeCount++
}

console.log(`Total ${walletBalance + tradeBalance}`.green, tradeCount, 'trades.', ` Total tax ${totalTax}`.red)