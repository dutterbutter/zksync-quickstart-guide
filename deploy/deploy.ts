import { deployContract } from "./utils";

// An example of a basic deploy script
// It will deploy a CrowdfundingCampaign contract to selected network
export default async function () {
  const contractArtifactName = "CrowdfundingCampaign";
  const constructorArguments = [.05];
  await deployContract(contractArtifactName, constructorArguments);
}
