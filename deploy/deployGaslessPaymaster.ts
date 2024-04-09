import { deployContract } from "./utils";
import { ethers } from "ethers";

// An example of a basic deploy script
// It will deploy a CrowdfundingCampaign contract to selected network
// `parseEther` converts ether to wei, and `.toString()` ensures serialization compatibility.
export default async function () {
  const contractArtifactName = "Greeter";
  const constructorArguments = ["TEST"];
  await deployContract(contractArtifactName, constructorArguments);
}