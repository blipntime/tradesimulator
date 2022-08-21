#!/usr/bin/env node
'use strict';

require('colors')

// initial investment!
// all subsequent investment will be from gains
let walletBalance = 1200 
let tradeBalance = 0

let totalTax = 0
const GAINS = [.4, .5, .6, .7] // .4=0 .5=20K, .6=50K, .7=100K
const NO_REINVEST_RATIO = .55

const randomGain = availableAmt => {
  let range = availableAmt < 20000 ? 1 :
    availableAmt < 50000 ? 2 :
    availableAmt < 100000 ? 3 :
    4
  return GAINS[Math.floor(Math.random() * range)]
}

const calcTaxRate = gain => {
  if (gain < 10000) {
    return 0
  } else if (gain < 100000) {
    return .15
  } else if (gain < 500000) {
    return .2
  }
  return .25
}

let taxPaid 
let lastTradeBalanceSettled 
let premiumPaid = 0
let cashOut = 0
let totalCashout = 0

const upgradeToPremium = () => {
  if (tradeBalance > 10000 && premiumPaid === 0) {
    premiumPaid = tradeBalance * .05
    walletBalance -= premiumPaid
    console.log(`Upgraded to premium `, `-${premiumPaid}`.red)
  }
}

// always invest half
const invest = () => {
  walletBalance = 870
  tradeBalance = 1430
  lastTradeBalanceSettled = tradeBalance
}

const trade = () => {
  tradeCount++
  taxPaid = 0
  const startingTradeBalance = tradeBalance
  let lastGain = randomGain(startingTradeBalance)
  tradeBalance = tradeBalance * (1 + lastGain)
  const lastDiff = tradeBalance - startingTradeBalance
  console.log(`${tradeCount}. Traded ${startingTradeBalance} -> ${tradeBalance}`.cyan, `+${lastDiff}`.green, `${tradeBalance / startingTradeBalance * 100 - 100}%`.cyan)
}

const settle = () => {
  const diff = tradeBalance - lastTradeBalanceSettled
  console.log(`+${diff}`.green)
  // send tax on gain to exhange
  const taxRate = calcTaxRate(diff)
  taxPaid = diff * taxRate
  walletBalance -= taxPaid
  totalTax += taxPaid

  console.log(`${taxRate * 100}% Tax paid`, `${taxPaid ? ('-'+taxPaid) : 'NOTHING'}`.red)
  
  // move out part of profit to wallet
  let moveOut = diff * NO_REINVEST_RATIO
  if (tradeBalance - moveOut > 170000) {
    moveOut = tradeBalance - 170000 // never go above 170000
  }
  moveOut *= .99
  console.log(`Moved to wallet`, `${moveOut}`.green)

  walletBalance += moveOut
  tradeBalance -= moveOut
  cashOut = walletBalance - tradeBalance / 2
  totalCashout += cashOut
  walletBalance -= cashOut
  
  lastTradeBalanceSettled = tradeBalance
  
  upgradeToPremium()
}

const printStatus = () => {
  console.log(`Trade:`, `${tradeBalance}`.green, `Cash out:`, `${cashOut}`.green, `Wallet:`, `${walletBalance}`.green,
   `\n\n`)
}

printStatus()

invest()

printStatus()

let tradeCount = 0

while (walletBalance + tradeBalance + totalCashout < 415000) { //while (totalCashout < 350000) {
  trade()

  if (tradeCount % 2 === 0) {
    settle() // every other time
    printStatus()
  }
}

if (taxPaid === 0) {
  settle()
  printStatus()
}

console.log(`Total`, `${walletBalance + tradeBalance + totalCashout}`.green, `Total tax `, `${totalTax}`.red)
console.log(`Total Cash out`, `${totalCashout}`.green)