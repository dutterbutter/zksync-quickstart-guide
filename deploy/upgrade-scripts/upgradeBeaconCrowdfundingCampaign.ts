import { getWallet } from "../utils";
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as zk from 'zksync-ethers';
import { Contract } from 'ethers';

export default async function (hre: HardhatRuntimeEnvironment) {
    const wallet = getWallet();
    const deployer = new Deployer(hre, wallet);
    const beaconAddress = '0x327b78565aE24328FB09a557c4062A242591DAB1';
    
    const crowdfundingCampaignV2 = await deployer.loadArtifact('CrowdfundingCampaignV2');
    await hre.zkUpgrades.upgradeBeacon(deployer.zkWallet, beaconAddress, crowdfundingCampaignV2);
    console.log('Successfully upgraded crowdfundingCampaign to crowdfundingCampaignV2', beaconAddress);

    const attachTo = new zk.ContractFactory<any[], Contract>(
        crowdfundingCampaignV2.abi,
        crowdfundingCampaignV2.bytecode,
        deployer.zkWallet,
        deployer.deploymentType,
    );
    const beaconProxyAddress = "0x38392b26873CfF4cFc83a6c9fffa7f4d110223a5";
    const upgradedCrowdfundingCampaign  = attachTo.attach(beaconProxyAddress);

    upgradedCrowdfundingCampaign.connect(deployer.zkWallet);
    // wait some time before the next call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const durationInSeconds = 30 * 24 * 60 * 60; // For example, setting a 30-day duration

    const initTx = await upgradedCrowdfundingCampaign.initializeV2(durationInSeconds);
    const receipt = await initTx.wait();

    console.log('CrowdfundingCampaignV2 initialized!', receipt.hash);

    const fundraisingGoal = await upgradedCrowdfundingCampaign.getFundingGoal();
    console.log('Fundraising goal:', fundraisingGoal.toString());
}
