import { BigInt, TypedMap } from "@graphprotocol/graph-ts"
import {
  ChainlinkPrice,
  UniswapPrice
} from "../generated/schema"

export let BASIS_POINTS_DIVISOR = BigInt.fromI32(10000)
export let PRECISION = BigInt.fromI32(10).pow(30)

export let WETH = "0x327b9A7a5f2cA31D80AeBee45475E0c459C253C6"
export let BTC = "0x818Bbedd269418cFBf5F89e677f8BB149C55e239"
// export let BTC_B = "0x152b9d0fdc40c096757f570a51e494bd4b943e50"
export let MATIC = "0x1A0984564B6eE71C2897952021d09a513735AE9c"
// export let LINK = ""
// export let UNI = ""
// export let USDT = ""
// export let USDC = ""
// export let MIM = "0x130966628846bfd36ff31a822705796e8cb8c18d"
// export let SPELL = ""
// export let SUSHI = ""
// export let FRAX = ""
// export let DAI = ""
export let GMX = "0x7C2f2a67F81e16863c998492E8AADFd4afA11C92"
// export let USDC_E = "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664"
// export let USDC = "0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e"

export function timestampToDay(timestamp: BigInt): BigInt {
  return timestampToPeriod(timestamp, "daily")
}

export function timestampToPeriod(timestamp: BigInt, period: string): BigInt {
  let periodTime: BigInt

  if (period == "daily") {
    periodTime = BigInt.fromI32(86400)
  } else if (period == "hourly") {
    periodTime = BigInt.fromI32(3600)
  } else if (period == "weekly" ){
    periodTime = BigInt.fromI32(86400 * 7)
  } else {
    throw new Error("Unsupported period " + period)
  }

  return timestamp / periodTime * periodTime
}

export function getTokenDecimals(token: String): u8 {
  // if (token == BTC_B) {
  //   token = BTC
  // }

  let tokenDecimals = new Map<String, i32>()
  tokenDecimals.set(WETH, 18)
  tokenDecimals.set(BTC, 8)
  // tokenDecimals.set(MIM, 18)
  tokenDecimals.set(MATIC, 18)
  // tokenDecimals.set(USDC_E, 6)
  // tokenDecimals.set(USDC, 6)
  tokenDecimals.set(GMX, 18)

  return tokenDecimals.get(token) as u8
}

export function getTokenAmountUsd(token: String, amount: BigInt): BigInt {
  let decimals = getTokenDecimals(token)
  let denominator = BigInt.fromI32(10).pow(decimals)
  let price = getTokenPrice(token)
  return amount * price / denominator
}

export function getTokenPrice(token: String): BigInt {
  // if (token == BTC_B) {
  //   token = BTC
  // }

  if (token != GMX) {
    let chainlinkPriceEntity = ChainlinkPrice.load(token)
    if (chainlinkPriceEntity != null) {
      // all chainlink prices have 8 decimals
      // adjusting them to fit GMX 30 decimals USD values
      return chainlinkPriceEntity.value * BigInt.fromI32(10).pow(22)
    }
  }

  if (token == GMX) {
    let uniswapPriceEntity = UniswapPrice.load(GMX)

    if (uniswapPriceEntity != null) {
      return uniswapPriceEntity.value
    }
  }

  let prices = new TypedMap<String, BigInt>()
  prices.set(WETH, BigInt.fromI32(4000) * PRECISION)
  prices.set(BTC, BigInt.fromI32(50000) * PRECISION)
  prices.set(MATIC, BigInt.fromI32(100) * PRECISION)
  // prices.set(MIM, PRECISION)
  // prices.set(USDC_E, PRECISION)
  // prices.set(USDC, PRECISION)
  prices.set(GMX, BigInt.fromI32(30) * PRECISION)

  return prices.get(token) as BigInt
}
