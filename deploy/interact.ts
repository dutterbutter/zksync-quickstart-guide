import * as hre from "hardhat";
import { getWallet, getProvider } from "./utils";
import { ethers } from "ethers";
import { utils } from "zksync-ethers";

// Address of the contract to interact with
const CONTRACT_ADDRESS = "0xf811EA0B13DB10cBDDb32BB311000C69DbFE2Cb1";
if (!CONTRACT_ADDRESS)
  throw "⛔️ Provide address of the contract to interact with!";

// An example of a script to interact with the contract
export default async function() {
  console.log(`Running script to interact with contract ${CONTRACT_ADDRESS}`);
  const paymasterAddress = "0xB78284304181Ab44d5F73C6CC4881868044F7CC5";

  
  const provider = getProvider();
  let paymasterBalance = await provider.getBalance(paymasterAddress);
  console.log(`Paymaster ETH balance is now ${paymasterBalance.toString()}`);

  // Load compiled contract info
  const contractArtifact = await hre.artifacts.readArtifact("CrowdfundingCampaignV2");

  // Initialize contract instance for interaction
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    contractArtifact.abi,
    getWallet() // Interact with the contract on behalf of this wallet
  );

  // Run contract read function
  const response = await contract.getTotalFundsRaised();
  console.log(`Current funds raised is: ${response}`);

  const contributionAmount = ethers.parseEther("0.1");

  const paymasterParams = utils.getPaymasterParams(paymasterAddress, {
    type: "General",
    innerInput: new Uint8Array(),
  });

  const gasprice = await provider.getGasPrice();
  const transaction = await contract.contribute({
    value: contributionAmount,
    maxPriorityFeePerGas: 0n,
    maxFeePerGas: await provider.getGasPrice(),
    // hardhcoded for testing
    gasLimit: 800000n,
    customData: {
      gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT + 50000,
      paymasterParams,
    },
  });


  console.log(`Transaction hash of setting new message: ${transaction.hash}`);

  // Wait until transaction is processed
  await transaction.wait();

  // Read message after transaction
  console.log(`The amount raised now is: ${await contract.getTotalFundsRaised()}`);
}
