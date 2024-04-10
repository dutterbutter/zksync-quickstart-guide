import * as hre from "hardhat";
import { getWallet, getProvider } from "./utils";
import { ethers } from "ethers";
import { utils } from "zksync-ethers";

// Address of the contract to interact with
const CONTRACT_ADDRESS = "0xf811EA0B13DB10cBDDb32BB311000C69DbFE2Cb1";
const PAYMASTER_ADDRESS = "0xB78284304181Ab44d5F73C6CC4881868044F7CC5";
if (!CONTRACT_ADDRESS || !PAYMASTER_ADDRESS)
    throw new Error("Contract and Paymaster addresses are required.");

export default async function() {
  console.log(`Running script to interact with contract ${CONTRACT_ADDRESS} using paymaster ${PAYMASTER_ADDRESS}`);

  // Load compiled contract info
  const contractArtifact = await hre.artifacts.readArtifact(
    "CrowdfundingCampaignV2"
  );

  // Initialize contract instance for interaction
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    contractArtifact.abi,
    getWallet()
  );

  const response = await contract.getTotalFundsRaised();
  console.log(`Current funds raised is: ${response}`);

  const provider = getProvider();
  let balanceBeforeTransaction = await provider.getBalance(getWallet().address);
  console.log(`Wallet balance before contribution: ${ethers.formatEther(balanceBeforeTransaction)} ETH`);

  const contributionAmount = ethers.parseEther("0.01");
  // Get paymaster params
  const paymasterParams = utils.getPaymasterParams(PAYMASTER_ADDRESS, {
    type: "General",
    innerInput: new Uint8Array(),
  });

  const gasLimit = await contract.contribute.estimateGas({
    value: contributionAmount,
    customData: {
      gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
      paymasterParams: paymasterParams,
    },
  });

  const transaction = await contract.contribute({
    value: contributionAmount,
    maxPriorityFeePerGas: 0n,
    maxFeePerGas: await provider.getGasPrice(),
    gasLimit,
    // Pass the paymaster params as custom data
    customData: {
      gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
      paymasterParams,
    },
  });
  console.log(`Transaction hash of setting new message: ${transaction.hash}`);

  await transaction.wait();
  
  let balanceAfterTransaction = await provider.getBalance(getWallet().address);
  // Check the wallet balance after the transaction
  // We only pay the contribution amount, so the balance should be less than before
  // Gas fees are covered by the paymaster
  console.log(`Wallet balance after contribution: ${ethers.formatEther(balanceAfterTransaction)} ETH`);
  
  console.log(
    `The amount raised now is: ${await contract.getTotalFundsRaised()}`
  );
}
