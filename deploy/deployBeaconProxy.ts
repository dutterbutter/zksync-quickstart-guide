import { getWallet } from "./utils";
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import { ethers } from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export default async function (hre: HardhatRuntimeEnvironment) {
    const wallet = getWallet();
    const deployer = new Deployer(hre, wallet);

    const contractArtifact = await deployer.loadArtifact("CrowdfundingCampaign");
    const fundingGoalInWei = ethers.parseEther('0.1').toString();

    const beacon = await hre.zkUpgrades.deployBeacon(
        getWallet(),
        contractArtifact
    );
    await beacon.waitForDeployment();

    const crowdfunding = await hre.zkUpgrades.deployBeaconProxy(deployer.zkWallet, 
        await beacon.getAddress(), contractArtifact, [fundingGoalInWei]);
    await crowdfunding.waitForDeployment();

    console.log(`🚀 Crowdfunding contract deployed at: ${await crowdfunding.getAddress()}`);
    console.log('✅ Deployment complete!');
}
