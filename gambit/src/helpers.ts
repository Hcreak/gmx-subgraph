import { BigInt, TypedMap } from "@graphprotocol/graph-ts"
import {
  ChainlinkPrice
} from "../generated/schema"

export let BASIS_POINTS_DIVISOR = BigInt.fromString("10000")
export let PRECISION = BigInt.fromString("10").pow(30)

export let BTC = '0x818Bbedd269418cFBf5F89e677f8BB149C55e239'
export let ETH = '0x327b9A7a5f2cA31D80AeBee45475E0c459C253C6'
export let WMATIC = '0x1A0984564B6eE71C2897952021d09a513735AE9c'
// export let BUSD = '0xe9e7cea3dedca5984780bafc599bd69add087d56'
export let USDC = '0xc95C2B2747B7F7Ce3bfFb89306eF0cC0bcCb7D42'
export let USDT = '0x638bDC1D37e1eA4BeA753447B4f0929D97691435'

export function getHourId(timestamp: BigInt): string {
  let hourTimestamp = timestamp.toI32() / 3600 * 3600
  return hourTimestamp.toString()
}

export function getDayId(timestamp: BigInt): string {
  return timestampToDay(timestamp).toString()
}

export function timestampToDay(timestamp: BigInt): BigInt {
  return timestamp / BigInt.fromI32(86400) * BigInt.fromI32(86400)
}

export function isStable(token: string): boolean {
  // return token == BUSD || token == USDC || token == USDT
  return token == USDC || token == USDT
}

export function getTokenSymbol(tokenAddress: string): string {
  let tokenSymbols = new Map<String, string>()
  tokenSymbols.set(ETH, "ETH")
  tokenSymbols.set(BTC, "BTC")
  tokenSymbols.set(WMATIC, "MATIC")
  // tokenSymbols.set(BUSD, "BUSD")
  tokenSymbols.set(USDC, "USDC")
  tokenSymbols.set(USDT, "USDT")
  return tokenSymbols.get(tokenAddress)
}

export function getTokenDecimals(tokenAddress: string): u8 {
  let tokenDecimals = new Map<String, i32>()
  tokenDecimals.set(ETH, 18)
  tokenDecimals.set(BTC, 18)
  tokenDecimals.set(WMATIC, 18)
  // tokenDecimals.set(BUSD, 18)
  tokenDecimals.set(USDC, 18)
  tokenDecimals.set(USDT, 18)
  return tokenDecimals.get(tokenAddress) as u8
}

export function getTokenAmountUsd(tokenAddress: string, amount: BigInt): BigInt {
  let decimals = getTokenDecimals(tokenAddress)
  let denominator = BigInt.fromString("10").pow(decimals)
  let price = getTokenPrice(tokenAddress)
  return amount * price / denominator
}

export function getTokenPrice(tokenAddress: string): BigInt {
  let entity = ChainlinkPrice.load(tokenAddress)
  if (entity != null) {
    // all chainlink prices have 8 decimals
    // adjusting them to fit GMX 30 decimals USD values
    return entity.value * BigInt.fromString("10").pow(22)
  }
  let defaultPrices = new TypedMap<String, BigInt>()
  defaultPrices.set(ETH, BigInt.fromString("3300") * PRECISION)
  defaultPrices.set(BTC, BigInt.fromString("55000") * PRECISION)
  defaultPrices.set(WMATIC, BigInt.fromString("550") * PRECISION)
  // defaultPrices.set(BUSD, PRECISION)
  defaultPrices.set(USDC, PRECISION)
  defaultPrices.set(USDT, PRECISION)

  return defaultPrices.get(tokenAddress) as BigInt
}
