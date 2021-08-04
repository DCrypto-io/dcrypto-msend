var Multisender = artifacts.require("Multisender.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(Multisender);
};