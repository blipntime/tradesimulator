#!/usr/bin/env node
'use strict';

require('colors')

// initial investment!
// all subsequent investment will be from gains
let walletBalance = 1000 
let tradeBalance = 0

let totalTax = 0
const GAINS = [.3, .5, .6]
const NO_REINVEST_RATIO = .6

const randomGain = () => GAINS[Math.floor(Math.random() * 3)]

const calcTaxRate = gain => {
  if (gain < 100000) {
    return .15
  } else if (gain < 500000) {
    return .2
  }
  return .35
}

let lastGain
let taxPaid 
let lastTradeBalanceSettled 
let premiumPaid = 0

const upgradeToPremium = () => {
  if (tradeBalance > 100000 && premiumPaid === 0) {
    premiumPaid = tradeBalance * .05
    walletBalance -= premiumPaid
    console.log(`Upgraded to premium `, `-${premiumPaid}`.red)
  }
}

// always invest half
// deduct transfer cost 50 USDT later
const invest = () => {
  const toInvest = walletBalance / 2 // initial investment ratio
  walletBalance -= toInvest
  tradeBalance += toInvest
  lastTradeBalanceSettled = tradeBalance
}

const trade = () => {
  taxPaid = 0
  const startingTradeBalance = tradeBalance
  lastGain = randomGain()
  tradeBalance = tradeBalance * (1 + lastGain)
  const lastDiff = tradeBalance - startingTradeBalance
  console.log(`Traded ${startingTradeBalance} -> ${tradeBalance} = ${lastDiff} ${tradeBalance / startingTradeBalance * 100 - 100}%`.cyan)
}

const settle = () => {
  const diff = tradeBalance - lastTradeBalanceSettled
  // send tax on gain to exhange
  const taxRate = calcTaxRate(diff)
  taxPaid = diff * taxRate
  console.log(`${taxRate * 100}% Tax paid`, `-${taxPaid}`.red)
  
  walletBalance -= taxPaid
  totalTax += taxPaid
  // move out part of profit to wallet
  const moveOut = diff * NO_REINVEST_RATIO
  walletBalance += moveOut
  tradeBalance -= moveOut
  lastTradeBalanceSettled = tradeBalance
  upgradeToPremium()
}

const printStatus = () => 
  console.log(`wallet: `, `${walletBalance}`.green, `tradeBalance ${tradeBalance} \n\n`.green)

printStatus()

invest()

let tradeCount = 0

while (walletBalance + tradeBalance < 400000) {

  trade()

  if (tradeCount % 2 === 1) {
    settle() // every other time
    printStatus()
  }

  tradeCount++
}

if (taxPaid === 0) {
  settle()
}

console.log(`Total`, `${walletBalance + tradeBalance}`.green, `${tradeCount} trades. Total tax `, `${totalTax}`.red)