'use client';

import { contractAbi, contractAdress } from '@/app/constants/index.js';
import {
    useAccount,
    useWriteContract,
    useWaitForTransactionReceipt,
    useReadContract
} from 'wagmi';
import { stakingContractAbi, stakingContractAddress } from '@/app/constants/staking.js';
import { useCallback, useEffect, useState } from 'react';
import { fetchSupplierRates } from "@/lib/aave/aaveFetcher";
import { ethers, BigNumber } from "ethers";
import { useToast } from '@/hooks/use-toast';
import { estimateGas, readContract } from 'wagmi/actions'; // Correct imports for wagmi actions


const StakingPage = () => {
    const { address, isConnected } = useAccount(); // Vérifie si l'utilisateur est connecté
    const [stakeInput, setStakeInput] = useState(ethers.BigNumber.from(0)); // Initialise comme BigNumber
    const [stakedAmount, setStakedAmount] = useState(0); // Montant staké
    const [rewards, setRewards] = useState(0); // Récompenses
    const [tokenCount, setTokenCount] = useState(0); // Nombre de tokens disponibles
    const [availabletokenDisplay, setAvailabletokenDisplay] = useState(0); // Nombre de tokens disponibles
    const [stakeInputDisplay, setStakeInputDisplay] = useState(""); // Valeur visible (en tokens)

    const [liquidityRate, setLiquidityRate] = useState(0); // Taux de liquidité
    const [isLoading, setIsLoading] = useState(false); // Chargement pour l'état des transactions

    const { toast } = useToast();

    const { refetch: fetchLiquidityRate } = useReadContract({
        abi: stakingContractAbi,
        address: stakingContractAddress as `0x${string}`,
        functionName: "updateLiquidityRate",
        args: [address]
    });

    // Lire les données de staking de l'utilisateur
    const { refetch: fetchUserStake } = useReadContract({
        abi: stakingContractAbi,
        address: stakingContractAddress as `0x${string}`,
        functionName: "getStake",
        args: [address],
    });
    // Calculer les récompenses
    const { refetch: fetchRewards } = useReadContract({
        abi: stakingContractAbi,
        address: stakingContractAddress as `0x${string}`,
        functionName: "calculateRewards",
        args: [address],
    });
    // Fonction de staking
    const { writeContract, data: hash } = useWriteContract({});
    const { isLoading: isConfirming, isSuccess, isError, error } = useWaitForTransactionReceipt({
        hash // Passez le hash pour surveiller la transaction
    });

    // Fonction de unstaking
    const { writeContract: unstakeTokens, data: unstakehash } = useWriteContract({
        abi: stakingContractAbi,
        address: stakingContractAddress,
        functionName: "unstake",
    });
    // Lecture des tokens mintés
    const { refetch: fetchTokens } = useReadContract({
        abi: contractAbi,
        address: contractAdress as `0x${string}`,
        functionName: "getTotalMinted",
        args: [address],
    });
    // Mise à jour du taux de liquidité depuis Aave
    const handleUpdateRateFromAave = useCallback(async () => {
        try {
            const usdcRate = await fetchSupplierRates();
            const rateInRay = ethers.utils.parseUnits(usdcRate.toString(), 27); // Convert to ray
            const liquidityRate = Number(rateInRay) / 1e27;
            setLiquidityRate(liquidityRate * 100);
            return liquidityRate;
        } catch (err) {
            console.error("Error updating liquidity rate from Aave:", err);
            return null;
        }
    }, []);

    // Vérifie l'allowance
    const checkAllowance = async () => {
        try {
            const allowance = await useReadContract({
                abi: contractAbi,
                address: contractAdress as `0x${string}`,
                functionName: "allowance",
                args: [address, stakingContractAddress],
                watch: true,
            });

            const stakeAmountInWei = ethers.utils.parseUnits(stakeInput.toString(), 18);

            if (BigNumber.from(allowance).lt(stakeAmountInWei)) {
                console.error("Allowance insuffisante. Veuillez approuver le contrat.");
                return false;
            }
            return true;
        } catch (err) {
            console.error("Erreur lors de la vérification de l'allowance :", err);
            return false;
        }
    };

    // Approve le staking
    const handleApprove = async () => {
        try {
            const amountInWei = ethers.utils.parseUnits(stakeInput.toString(), 18);

            await writeContract({
                abi: contractAbi,
                address: contractAdress as `0x${string}`,
                functionName: "approve",
                args: [stakingContractAddress, amountInWei],
            });

            toast({
                title: "Succès",
                description: "Tokens approuvés pour le staking.",
                variant: "default",
            });
        } catch (err) {
            console.error("Erreur lors de l'approbation :", err);
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de l'approbation.",
                variant: "destructive",
            });
        }
    };
    const listenForDebugEvent = async () => {
        try {
            if (!window.ethereum) {
                throw new Error("Ethereum provider non disponible. Veuillez installer Metamask.");
            }

            // Instanciez un fournisseur Ethereum
            const provider = new ethers.providers.Web3Provider(window.ethereum);

            // Créez une instance de votre contrat
            const stakingContract = new ethers.Contract(
                stakingContractAddress, // Adresse de votre contrat
                stakingContractAbi, // ABI de votre contrat
                provider
            );

            // Écoutez l'événement Debug
            stakingContract.on("Debug", (user, amount, approved) => {
                console.log("Événement Debug capturé :");
                console.log("Utilisateur :", user);
                console.log("Montant :", ethers.utils.formatUnits(amount, 18)); // Convertir en unité lisible
                console.log("Approuvé :", approved);
            });
        } catch (err) {
            if (err instanceof Error) {
                console.error("Erreur lors de l'écoute des événements :", err.message || err);
            }
        }
    };

    useEffect(() => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const stakingContract = new ethers.Contract(stakingContractAddress, stakingContractAbi, provider);

        // Supprimez tous les écouteurs existants pour éviter les doublons
        stakingContract.removeAllListeners("Debug");

        // Ajoutez un nouvel écouteur
        listenForDebugEvent();

        // Cleanup lors du démontage du composant
        return () => {
            stakingContract.removeAllListeners("Debug");
        };
    }, []);

    // Fonction pour gérer le changement de l'input utilisateur
    const handleStakeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        setStakeInputDisplay(inputValue);

        if (!isNaN(inputValue) && inputValue !== "") {

            const valueInWei = ethers.utils.parseUnits(inputValue, 18); // Convertir en wei
            setStakeInput(valueInWei); // Stocker la valeur en wei
        } else {
            setStakeInput(ethers.BigNumber.from(0)); // Réinitialiser si l'input est invalide
        }
    };
    // Handle Staking
    const handleStake = async () => {
        setIsLoading(true); // Active l'état de chargement
        try {
            // const amountInWei = ethers.utils.parseUnits(stakeInput.toString(), 18);
            const amountInWei = stakeInput;
            const tokenCountInWei = ethers.utils.parseUnits(tokenCount.toString(), 18);

            if (stakeInput.gt(tokenCountInWei)) {
                toast({
                    title: "Erreur",
                    description: "Vous n'avez pas assez de tokens pour staker ce montant.",
                    variant: "destructive",
                });
                return;
            }



            // Vérifiez l'allowance
            const isAllowanceSufficient = await checkAllowance();
            if (!isAllowanceSufficient) {
                // console.log("Demande d'approbation en cours...");
                await handleApprove();
            }
            await writeContract({
                abi: stakingContractAbi,
                address: stakingContractAddress as `0x${string}`,
                functionName: "stake",
                args: [amountInWei],
            });


            toast({
                title: "En cours",
                description: "Tokens en cours de staking!",
                variant: "default",
            });

            // Rafraîchissez les données
            fetchUserStake();
            fetchRewards();
        } catch (err) {
            if (err instanceof Error) {
                console.error("Erreur lors du staking :", err.message);
                toast({
                    title: "Erreur",
                    description: err.message || "Une erreur est survenue lors du staking.",
                    variant: "destructive",
                });
            } else {
                // Pour les erreurs non typées
                console.error("Erreur inconnue lors du staking :", err);
                toast({
                    title: "Erreur",
                    description: "Une erreur inconnue est survenue lors du staking.",
                    variant: "destructive",
                });
            }
        } finally {
            setIsLoading(false); // Désactive l'état de chargement
        }
    };
    const handleUnstake = async () => {
        console.log("future unstake ICI");

    }

    // Récupère les données du contrat
    const fetchContractData = async () => {
        try {
            const rate = await handleUpdateRateFromAave();
            const userStake = await fetchUserStake();

            if (Array.isArray(userStake.data) && userStake.data.length > 0) {
                const stakeAmount = userStake.data[0];
                setStakedAmount(Number(stakeAmount) / 1e36 || 0);
            }
            // const stakedAmount = ethers.utils.formatUnits(userStake.data[0], 18);

            // setStakedAmount(Number(stakedAmount));

            const userRewards = await fetchRewards();
            const availableToken = await fetchTokens();

            setRewards(Number(userRewards?.data) / 1e18);
            setTokenCount(Number(availableToken?.data) || 0);
            // setTokenCount(Number(ethers.utils.formatUnits(availableToken?.data, 18)) || 0);
            setAvailabletokenDisplay(availableToken?.data as number)
        } catch (err) {
            console.error("Erreur lors de la récupération des données :", err);
        }
    };

    useEffect(() => {
        fetchContractData();
    }, [address]);

    useEffect(() => {
        if (isSuccess) {
            toast({
                title: "Succès",
                description: "Transaction confirmée, tokens stakés avec succès.",
                variant: "default",
            });

            // Rafraîchissez les données
            fetchUserStake();
            fetchRewards();
        }

        if (isError) {
            toast({
                title: "Erreur",
                description: error?.message || "Une erreur est survenue lors de la transaction.",
                variant: "destructive",
            });
        }
    }, [isSuccess, isError, error]);
    return (
        <div className="container mx-auto p-6 bg-gray-100 min-h-screen flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
                <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
                    Staking Dashboard
                </h1>
                <p className="text-lg text-gray-700 text-center mb-6">
                    Rendement actuel proposé :{" "}
                    <strong className="text-green-500">
                        {!isNaN(liquidityRate) ? `${liquidityRate.toFixed(2)}%` : "N/A"}
                    </strong>
                </p>

                {isConnected ? (
                    <>
                        <div className="bg-blue-50 p-4 rounded-lg shadow-sm mb-4">
                            <p className="text-md text-gray-800">
                                <strong>Tokens disponibles :</strong> {availabletokenDisplay} SunFi
                            </p>
                            <p className="text-md text-gray-800 mt-2">
                                <strong>Vos Récompenses :</strong> {rewards} SunFi
                            </p>
                            <p className="text-md text-gray-800 mt-2">
                                {stakedAmount > 0 ? (
                                    <>
                                        <strong>Tokens stakés :</strong> {stakedAmount} tokens.
                                        {/* <strong>Tokens stakés :</strong> {stakedAmount} tokens. */}
                                    </>
                                ) : (
                                    "Vous n'avez pas encore staké de tokens."
                                )}
                            </p>
                        </div>

                        <div className="mt-6">
                            {/* Input pour le montant à staker */}
                            <label
                                htmlFor="stakeInput"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Montant à staker :
                            </label>
                            <div className="flex mb-4">
                                <input
                                    id="stakeInput"
                                    type="number"
                                    placeholder="Entrez le montant"
                                    value={stakeInputDisplay}
                                    onChange={handleStakeInputChange}
                                    // onChange={(e) => setStakeInput(Number(e.target.value) || 0)}
                                    className="flex-1 border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {stakeInput.gt(ethers.utils.parseUnits(tokenCount.toString(), 18)) && (
                                <p className="text-red-500 text-sm mb-2">
                                    Vous ne pouvez pas staker plus que vos tokens disponibles.
                                </p>
                            )}

                            {/* Boutons Stake et Unstake côte à côte */}
                            <div className="flex gap-4 mt-4">
                                <button
                                    onClick={handleStake}

                                    className={`flex-1 py-2 px-4 rounded-lg text-white font-semibold ${isLoading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-blue-500 hover:bg-blue-600"
                                        }`}
                                >
                                    {isLoading ? "En cours..." : "Stake"}
                                </button>

                                <button
                                    onClick={handleUnstake} // Fonction pour unstake
                                    disabled={true}
                                    className={`flex-1 py-2 px-4 rounded-lg text-white font-semibold ${isLoading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-red-500 "
                                        }`}
                                >
                                    {isLoading ? "Unstaking..." : "Unstake"}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center text-gray-500">
                        <p>Connectez votre wallet pour commencer à staker.</p>
                    </div>
                )}

                <p className="text-sm text-gray-500 mt-6 text-center">
                    All rights reserved © SunFi 2025
                </p>
            </div>
        </div>
    );
};

export default StakingPage;