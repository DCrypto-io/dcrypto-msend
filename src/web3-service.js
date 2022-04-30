import { ERC20ABI, MultisenderABI } from "./abis";
import { sum } from "./utils";

/*
 * -------------- Updated SendToken Method ------------------
 */

export async function sendToken(tokenAddress, userAddress, sendData) {
  // Get Multisender Contract Address
  const multiSenderAddress = "0x186D606d727158349810B4f7859FBD2e652EEAAD";

  //   Extract Addresses and Amounts in separate arrays
  const addresses = sendData.map((d) => d.address);
  const amounts = sendData.map((d) => d.amount);

  try {
    const web3 = window.web3;
    // Get Token Contract

    const contract = new web3.eth.Contract(ERC20ABI, tokenAddress);

    // Get Token Data
    const userTokenBalance = await contract.methods
      .balanceOf(userAddress)
      .call();
    const decimal = await contract.methods.decimals().call();
    const tokenDecimals = web3.utils.toBN(decimal);

    const totalAmount = amounts.reduce((a, c) => a + c);
    const totalAmountToSend = web3.utils.toHex(
      web3.utils.toBN(totalAmount).mul(web3.utils.toBN(10).pow(tokenDecimals))
    );

    if (userTokenBalance / Math.pow(10, decimal) < totalAmount)
      throw new Error("Insufficient token balance");

    const gasPrice = await web3.eth.getGasPrice();

    // Transfer total amount to multisender contract
    await contract.methods
      .transfer(multiSenderAddress, totalAmountToSend)
      .send({
        from: userAddress,
        gasPrice: gasPrice,
      });

    // Get gas amount for single transaction of max amount
    const maxAmount = Math.max(...amounts);
    const maxAmountToSend = web3.utils.toHex(
      web3.utils.toBN(maxAmount).mul(web3.utils.toBN(10).pow(tokenDecimals))
    );

    // ---------------------------------------------------------------------------------
    // We are not transferring here, this is just gas estimation of maximum amount transfer
    const gasForSingleTransaction = await contract.methods
      .transfer(addresses[0], maxAmountToSend)
      .estimateGas({
        from: userAddress,
      });
    console.log(">>>>> gasForSingleTransaction", gasForSingleTransaction);
    //  ---------------------------------------------------------------------------------

    // 2. Send amounts to receivers from Multisender contract

    // Get MultiSender Contract
    const multisender = new window.web3.eth.Contract(
      MultisenderABI,
      multiSenderAddress
    );

    // Call bulkSendTokens
    const amountsToSend = amounts.map((a) =>
      web3.utils.toHex(
        web3.utils.toBN(a).mul(web3.utils.toBN(10).pow(tokenDecimals))
      )
    );

    //   Gas Estimation
    const gas = await multisender.methods
      .bulkSendTokens(tokenAddress, addresses, amountsToSend)
      .estimateGas({
        from: userAddress,
      });
    console.log(">>>>>> Gas Amount", gas);

    const sendData = {
      from: userAddress,
      gasPrice: gasPrice,
    };

    const txArray = [];

    txArray.push(
      await multisender.methods
        .bulkSendTokens(tokenAddress, addresses, amountsToSend)
        .send(sendData)
    );

    return txArray;
  } catch (error) {
    console.log(error);
  }
}

// Empty Method
export function sendBNB() {}
