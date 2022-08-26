#!/usr/bin/env node
'use strict';

require('colors')

let walletBalance = 0 
let tradeBalance = 0

let totalTax = 0
const GAINS = [.4, .5, .6, .7] // .4=0 .5=20K, .6=50K, .7=100K
const NO_REINVEST_RATIO = .55
const RESERVE_RATIO = .45

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

let profitToSettle = 0
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
  walletBalance = 0
  tradeBalance = 4000
}

const trade = () => {
  tradeCount++
  const startingTradeBalance = tradeBalance
  let lastGain = randomGain(startingTradeBalance)
  const profit = tradeBalance * lastGain
  tradeBalance += profit
  profitToSettle += profit
  
  console.log(`${tradeCount}. Traded ${startingTradeBalance} -> ${tradeBalance}`.cyan, `+${profit}`.green, `${lastGain * 100}%`.cyan)

  return profit
}

const settle = lastProfit => {
  let taxPaid = 0
  let taxRate = 0

  if (profitToSettle > 9999) {
    console.log(`+${profitToSettle}`.green)
    // send tax on gain to exhange
    taxRate = calcTaxRate(profitToSettle)
    taxPaid = profitToSettle * taxRate
    walletBalance -= taxPaid
    totalTax += taxPaid
    profitToSettle = 0
  }

  console.log(`${taxRate * 100}% Tax paid`, `${taxPaid ? ('-'+taxPaid) : 'NOTHING'}`.red)
  
  // move out part of profit to wallet
  let moveOut = lastProfit * NO_REINVEST_RATIO
  if (tradeBalance - moveOut > 170000) {
    moveOut = tradeBalance - 170000 // never go above 170000
  }
  moveOut *= .99 // 1% sending fee
  console.log(`Moved to wallet`, `${moveOut}`.green)

  walletBalance += moveOut
  tradeBalance -= moveOut
  cashOut = Math.max(walletBalance - tradeBalance * RESERVE_RATIO, 0)
  totalCashout += cashOut
  walletBalance -= cashOut
  
  upgradeToPremium()
}

const printStatus = () => {
  const ratio = walletBalance / tradeBalance
  console.log(`Trade:`, `${tradeBalance}`.green, `Cash out:`, `${cashOut}`.green, `Wallet:`, `${walletBalance}`.green, 
    ratio < RESERVE_RATIO ? `Wallet to Trade Ratio Low! ${ratio * 100}%`.red : ``, `\n\n`)
}

invest()

printStatus()

let tradeCount = 0

while (walletBalance + tradeBalance + totalCashout < 415000) { //while (totalCashout < 350000) {
  const lastProfit = trade()

  settle(lastProfit) // every other time
  printStatus()
}

if (profitToSettle > 0) {
  settle()
  printStatus()
}

console.log(`Total`, `${walletBalance + tradeBalance + totalCashout}`.green, `Total tax `, `${totalTax}`.red)
console.log(`Total Cash out`, `${totalCashout}`.green)
