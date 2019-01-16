var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var Card = artifacts.require("./Card.sol");

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(Card);
};
