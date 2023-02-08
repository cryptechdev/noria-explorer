const prefix = "noria";

export default {
  chainId: "oasis-2",
  chainName: "Noria Testnet",
  rpc: "https://chaos-rpc.cryptodollar.dev",
  rest: "https://chaos-lcd.cryptodollar.dev",
  walletUrlForStaking: "https://app.noria.network/noria/staking",
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: prefix,
    bech32PrefixAccPub: prefix + "pub",
    bech32PrefixValAddr: prefix + "valoper",
    bech32PrefixValPub: prefix + "valoperpub",
    bech32PrefixConsAddr: prefix + "valcons",
    bech32PrefixConsPub: prefix + "valconspub",
  },
  currencies: [
    {
      coinDenom: "NORIA",
      coinMinimalDenom: "unoria",
      coinDecimals: 6,
      coinGeckoId: prefix,
    },
    {
      coinDenom: "CRD",
      coinMinimalDenom: "ucrd",
      coinDecimals: 6,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "NORIA",
      coinMinimalDenom: "unoria",
      coinDecimals: 6,
    },
    {
      coinDenom: "CRD",
      coinMinimalDenom: "ucrd",
      coinDecimals: 6,
    },
  ],
  stakeCurrency: {
    coinDenom: "NORIA",
    coinMinimalDenom: "unoria",
    coinDecimals: 6,
    coinGeckoId: prefix,
  },
  coinType: 118,
  gasPriceStep: {
    low: 0.0005,
    average: 0.0025,
    high: 0.005,
  },
  features: ["cosmwasm", "ibc-transfer"],
};
