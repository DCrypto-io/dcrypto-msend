import { ERC20ABI, Multisender } from './abis'

export async function sendToken(tokenAddress, userAddress, sendData) {
    const multiSenderAddress = process.env.REACT_APP_MULTISENDER_ADDRESS;
    
    const addresses = sendData.map(d => d.address);
    const amounts = sendData.map(d => d.amount);

    try {

        const web3 = window.web3;

        // 1. Transfer total amounts for Multisender contract to send
        const contract = new web3.eth.Contract(ERC20ABI, tokenAddress);
        const userTokenBalance = await contract.methods.balanceOf(userAddress).call();
        const decimal = await contract.methods.decimals().call();
        const tokenDecimals = web3.utils.toBN(decimal); 

        const totalAmount = amounts.reduce((a, c) => a + c); 
        const totalAmountToSend = web3.utils.toHex(web3.utils.toBN(totalAmount).mul(web3.utils.toBN(10).pow(tokenDecimals)));
        
        if (userTokenBalance / Math.pow(10, decimal) < totalAmount) throw new Error('Insufficient token balance'); 
        
        const gasPrice = await web3.eth.getGasPrice();

        await contract.methods.transfer(multiSenderAddress, totalAmountToSend).send({
            from: userAddress,
            //gas: gas,
            gasPrice: gasPrice,
        });
        console.log(await web3.eth.getGasPrice());
        
        // Get gas amount for single transaction of max amount
        const maxAmount = Math.max(...amounts);
        const maxAmountToSend = web3.utils.toHex(web3.utils.toBN(maxAmount).mul(web3.utils.toBN(10).pow(tokenDecimals)));

        const gasForSingleTransaction = await contract.methods.transfer(addresses[0], maxAmountToSend).estimateGas({
            from: userAddress
        }); console.log('>>>>> gasForSingleTransaction', gasForSingleTransaction)

        // 2. Send amounts to receivers from Multisender contract
        const multisender = new window.web3.eth.Contract(Multisender.abi, multiSenderAddress);
        const amountsToSend = amounts.map(a => web3.utils.toHex(web3.utils.toBN(a).mul(web3.utils.toBN(10).pow(tokenDecimals))));

        const pageSize = 500;
        const txArray = [];
        for (let i = 0; i <= parseInt(addresses.length / pageSize); i++) {
            const pageAddresses = addresses.slice(i * pageSize, (i + 1) * pageSize);
            const pageAmountsToSend = amountsToSend.slice(i * pageSize, (i + 1) * pageSize);

            const gas = await multisender.methods.bulkSendTokens(tokenAddress, pageAddresses, pageAmountsToSend).estimateGas({
                from: userAddress
            });
            console.log('>>>>>> Gas Amount', gas);

            const sendData = {
                from: userAddress,
                // gas: gas,
                gasPrice: gasPrice,
            };

            // Set contract owner fee as payable amount
            if (gas < gasForSingleTransaction * pageAddresses.length) sendData.value = web3.utils.toWei(`${gasForSingleTransaction * pageAddresses.length - gas}`, 'gwei')
            
            txArray.push(
                await multisender.methods.bulkSendTokens(tokenAddress, pageAddresses, pageAmountsToSend).send(sendData)
            );
        }
        return txArray;
    } catch (e) {
        console.error(e);
        throw e;
    }
}