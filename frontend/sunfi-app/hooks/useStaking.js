import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import {
    useWriteContract,
    useReadContract
} from "wagmi";
import { fetchSupplierRates } from "@/lib/aave/aaveFetcher";
import { contractAbi, contractAdress } from "@/app/constants/index.js";
import { stakingContractAbi, stakingContractAddress } from '@/app/constants/staking.js';

const useStaking = (address) => {
    const [stakedAmount, setStakedAmount] = useState(0);
    const [rewards, setRewards] = useState(0);
    const [tokenCount, setTokenCount] = useState(0);
    const [liquidityRate, setLiquidityRate] = useState(0);

    const { refetch: fetchUserStake } = useReadContract({
        abi: stakingContractAbi,
        address: stakingContractAddress,
        functionName: "stakes",
        args: [address],
    });

    const { refetch: fetchRewards } = useReadContract({
        abi: stakingContractAbi,
        address: stakingContractAddress,
        functionName: "calculateRewards",
        args: [address],
    });

    const { refetch: fetchTokens } = useReadContract({
        abi: contractAbi,
        address: contractAdress,
        functionName: "getTotalMinted",
        args: [address],
    });

    const { writeAsync: stakeTokens } = useWriteContract({
        abi: stakingContractAbi,
        address: stakingContractAddress,
        functionName: "stake",
    });
    console.log("stakeTokens from useWriteContract:", stakeTokens);

    const { writeAsync: unstakeTokens } = useWriteContract({
        abi: stakingContractAbi,
        address: stakingContractAddress,
        functionName: "unstake",
    });

    const handleUpdateRateFromAave = useCallback(async () => {
        try {
            const usdcRate = await fetchSupplierRates();
            const rateInRay = ethers.parseUnits(usdcRate.toString(), 27);
            const calculatedRate = Number(rateInRay) / 1e27;
            setLiquidityRate(calculatedRate * 100);
            return calculatedRate;
        } catch (err) {
            console.error("Error updating liquidity rate from Aave:", err);
            return null;
        }
    }, []);

    const fetchContractData = useCallback(async () => {
        try {
            const rate = await handleUpdateRateFromAave();
            const userStake = await fetchUserStake();
            const userRewards = await fetchRewards();
            const availableToken = await fetchTokens();

            if (Array.isArray(userStake.data) && userStake.data.length > 0) {
                const stakeAmount = userStake.data[0];
                setStakedAmount(Number(stakeAmount) / 1e18 || 0);
            }

            setLiquidityRate(rate * 100);
            setRewards(Number(userRewards?.data) / 1e18);
            setTokenCount(Number(availableToken?.data) || 0);
        } catch (err) {
            console.error("Erreur lors de la récupération des données :", err);
        }
    }, [fetchUserStake, fetchRewards, fetchTokens, handleUpdateRateFromAave]);

    const stake = useCallback(
        async (amount) => {
            try {
                const amountInWei = ethers.parseUnits(amount.toString(), 18);

                console.log("Stake Tokens:", stakeTokens);
                if (!stakeTokens) {
                    console.error("stakeTokens is not defined");
                    return;
                }

                await stakeTokens({
                    args: [amountInWei],
                });

                console.log("Tokens staked avec succès !");
                await fetchContractData(); // Rafraîchir les données après le staking
            } catch (err) {
                console.error("Erreur lors du staking :", err);
            }
        },
        [stakeTokens, fetchContractData]
    );

    const unstake = useCallback(
        async (amount) => {
            try {
                const amountInWei = ethers.parseUnits(amount.toString(), 18);
                await unstakeTokens?.({ args: [amountInWei] });
                console.log("Tokens unstaked avec succès !");
                await fetchContractData(); // Rafraîchir les données après le unstaking
            } catch (err) {
                console.error("Erreur lors du unstaking :", err);
            }
        },
        [unstakeTokens, fetchContractData]
    );

    useEffect(() => {
        if (address) fetchContractData();
    }, [address, fetchContractData]);

    return {
        stakedAmount,
        rewards,
        tokenCount,
        liquidityRate,
        stake,
        unstake,
    };
};

export default useStaking;