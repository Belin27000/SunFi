import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("SunFi contract test", function () {

    async function deployContract() {
        const [owner, addr1, addr2] = await hre.ethers.getSigners();
        const contractDeployed = await hre.ethers.deployContract("SunFi");

        return { contractDeployed, owner, addr1, addr2 }
    }

    it("Should set the right owner", async function () {
        const { owner, contractDeployed } = await loadFixture(deployContract)
        expect(await contractDeployed.owner()).to.equal(owner.address);
    })
});
