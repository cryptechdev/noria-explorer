import { isTestnet } from "@/libs/utils";
import { sha256 } from "@cosmjs/crypto";
import { toHex } from "@cosmjs/encoding";

let chains = {};
const coingecko = {};
let configs = require.context("../../chains/mainnet", false, /\.json$/);
// if (isTestnet()) {
//   configs = require.context("../../chains/testnet", false, /\.json$/);
// }

const update = {};
configs.keys().forEach((k) => {
  const c = configs(k);
  if (c.chain_name !== process.env.VUE_APP_CHAIN_NAME) return;
  c.chain_name = String(c.chain_name).toLowerCase();
  update[c.chain_name] = c;
  if (Array.isArray(c.assets)) {
    c.assets.forEach((x) => {
      if (x.coingecko_id && x.coingecko_id !== "")
        coingecko[x.coingecko_id] = String(x.symbol).toUpperCase();
    });
  }
});

chains = update;
localStorage.setItem("chains", JSON.stringify(update));
const selected = chains[process.env.VUE_APP_CHAIN_NAME];

const avatarcache = localStorage.getItem("avatars");

export default {
  namespaced: true,
  state: {
    keplr: {},
    config: chains,
    selected,
    avatars: avatarcache ? JSON.parse(avatarcache) : {},
    height: 0,
    ibcChannels: {},
    quotes: {},
    defaultWallet: localStorage.getItem("default-wallet"),
    denoms: {},
    ibcPaths: {},
  },
  getters: {
    getchains: (state) => state.chains,
    getAvatarById: (state) => (id) => state.avatars[id],
    getKeplrConfig: (state) => state.keplr,
  },
  mutations: {
    setup_sdk_version(state, info) {
      state.chains.config[info.chain_name].sdk_version = info.version;
    },
    select(state, args) {
      state.chains.selected = state.chains.config[args.chain_name];
    },
    cacheAvatar(state, args) {
      state.chains.avatars[args.identity] = args.url;
      localStorage.setItem("avatars", JSON.stringify(state.chains.avatars));
    },
    setHeight(state, height) {
      state.chains.height = height;
    },
    setChannels(state, { chain, channels }) {
      state.chains.ibcChannels[chain] = channels;
    },
    setQuotes(state, quotes) {
      state.quotes = quotes;
    },
    setDefaultWallet(state, defaultWallet) {
      if (defaultWallet && defaultWallet.length > 0) {
        localStorage.setItem("default-wallet", defaultWallet);
        state.chains.defaultWallet = defaultWallet;
      } else {
        state.chains.defaultWallet = null;
      }
    },
    setIBCDenoms(state, denoms) {
      state.denoms = { ...state.denoms, ...denoms };
    },
    setIBCPaths(state, paths) {
      state.ibcPaths = paths;
    },
    setKeplrConfig(state, config) {
      state.keplr = JSON.parse(JSON.stringify(config));
    },
  },
  actions: {
    async getQuotes(context) {
      // fetch('https://price.ping.pub/quotes').then(data => data.json()).then(data => {
      //   context.commit('setQuotes', data)
      // })
      const keys = Object.keys(coingecko);
      if (keys.length > 0) {
        const currencies = "usd,cny,eur,jpy,krw,sgd,hkd";
        fetch(
          `https://api.coingecko.com/api/v3/simple/price?include_24hr_change=true&vs_currencies=${currencies}&ids=${keys.join(
            ","
          )}`
        )
          .then((data) => data.json())
          .then((data) => {
            // use symbol as key instead of coingecko id
            const quotes = {};
            if (data && Object.keys(data)) {
              Object.keys(data).forEach((k) => {
                quotes[coingecko[k]] = data[k];
              });
            }
            context.commit("setQuotes", quotes);
          });
      }
    },

    async getAllIBCDenoms(context, _this) {
      _this.$http.getAllIBCDenoms().then((x) => {
        const denomsMap = {};
        const pathsMap = {};
        if (!x || !x.denom_traces) return;
        
        x.denom_traces.forEach((trace) => {
          const hash = toHex(
            sha256(
              new TextEncoder().encode(`${trace.path}/${trace.base_denom}`)
            )
          );
          const ibcDenom = `ibc/${hash.toUpperCase()}`;
          denomsMap[ibcDenom] = trace.base_denom;

          const path = trace.path.split("/");
          if (path.length >= 2) {
            pathsMap[ibcDenom] = {
              channel_id: path[path.length - 1],
              port_id: path[path.length - 2],
            };
          }
        });
        context.commit("setIBCDenoms", denomsMap);
        context.commit("setIBCPaths", pathsMap);
      });
    },

    async getKeplrConfig(context) {
      fetch(process.env.VUE_APP_KEPLR_CONFIG_URL, {
        method: "GET",
        mode: "cors",
      })
        .then((res) => res.json())
        .then((data) => {
          context.commit("setKeplrConfig", data);
        });
    },
  },
};
