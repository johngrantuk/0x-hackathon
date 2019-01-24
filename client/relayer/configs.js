"use strict";
exports.__esModule = true;
var constants_1 = require("./constants");
exports.TX_DEFAULTS = { gas: 400000 };
exports.MNEMONIC = 'concert load couple harbor equip island argue ramp clarify fence smart topic';
exports.BASE_DERIVATION_PATH = "44'/60'/0'/0";
exports.GANACHE_CONFIGS = {
    rpcUrl: 'http://127.0.0.1:8545',
    networkId: constants_1.GANACHE_NETWORK_ID
};
exports.KOVAN_CONFIGS = {
    rpcUrl: 'https://kovan.infura.io/',
    networkId: constants_1.KOVAN_NETWORK_ID
};
exports.ROPSTEN_CONFIGS = {
    rpcUrl: 'https://ropsten.infura.io/',
    networkId: constants_1.ROPSTEN_NETWORK_ID
};
exports.RINKEBY_CONFIGS = {
    rpcUrl: 'https://rinkeby.infura.io/',
    networkId: constants_1.RINKEBY_NETWORK_ID
};
exports.NETWORK_CONFIGS = exports.GANACHE_CONFIGS; // or KOVAN_CONFIGS or ROPSTEN_CONFIGS or RINKEBY_CONFIGS
//# sourceMappingURL=configs.js.map