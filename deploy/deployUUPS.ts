import { getWallet } from "./utils";
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import { ethers } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export default async function (hre: HardhatRuntimeEnvironment) {
    const wallet = getWallet();
    const deployer = new Deployer(hre, wallet);

    const contractArtifact = await deployer.loadArtifact("CrowdfundingCampaign_UUPS");
    const fundingGoalInWei = ethers.parseEther('0.1').toString();

    const crowdfunding = await hre.zkUpgrades.deployProxy(
        getWallet(),
        contractArtifact,
        [fundingGoalInWei],
        { initializer: 'initialize' }
    );

    await crowdfunding.waitForDeployment();

    console.log(`🚀 Crowdfunding contract deployed at: ${await crowdfunding.getAddress()}`);
    console.log('✅ Deployment complete!');
}
