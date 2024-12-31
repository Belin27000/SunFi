'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { contractAbi, contractAdress } from '@/app/constants/index.js';
import { useToast } from "@/hooks/use-toast";
import { getAddress } from 'ethers';


const EnergyCounter = () => {
    const { address } = useAccount(); // Vérifie si l'utilisateur est connecté
    const [energy, setEnergy] = useState(0);
    const [transactionHash, setTransactionHash] = useState(null);
    const [tokenCount, setTokenCount] = useState(0);
    const [isClientLoading, setIsClientLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);
    const [mintHistory, setMintHistory] = useState([]);
    const [maxMintable, setMaxMintable] = useState(0);



    const { toast } = useToast();

    const normalizedAddress = address ? getAddress(address) : null;


    // Lecture des tokens mintés
    const { refetch: fetchTokens } = useReadContract({
        abi: contractAbi,
        address: contractAdress,
        functionName: "getTotalMinted",
        args: [address],
    });
    //Verifie si l'adresse est une adresse cliente
    const { refetch: fetchClientStatus } = useReadContract({
        abi: contractAbi,
        address: contractAdress,
        functionName: 'getClient',
        args: [address],
        enable: !!normalizedAddress,
    })


    // Mint des tokens
    const { writeContract, data: hash } = useWriteContract({

    });

    // Suivi de la transaction
    const { isLoading: isConfirming, isSuccess, isError, error } = useWaitForTransactionReceipt({
        hash // Passez le hash pour surveiller la transaction
    });

    // Générer de l'énergie aléatoire
    const generateEnergy = () => {
        setEnergy((prevEnergy) => prevEnergy + Math.random() * 0.01);
    };
    // Vérifie si l'adresse connectée est un client
    const checkClientStatus = async () => {
        try {
            const result = await fetchClientStatus();
            setIsClient(result?.data || false);
        } catch (err) {
            console.error("Erreur lors de la vérification du client :", err);
            setIsClient(false);
        } finally {
            setIsClientLoading(false);
        }
    };
    // Fonction pour récupérer et mettre à jour le nombre de jetons
    const fetchTokenCount = async () => {
        try {
            const result = await fetchTokens();
            setTokenCount(Number(result?.data) || 0); // Met à jour avec les tokens récupérés
        } catch (err) {
            console.error("Erreur lors de la récupération des tokens :", err);
        }
    };


    // Mint des tokens
    const handleMint = async () => {

        try {
            toast({
                title: "En cours",
                description: `Minting de ${Math.floor(energy * 1000)} tokens...`,
                variant: "default",
            });

            // Envoie de la transaction avec les arguments
            const result = await writeContract({
                abi: contractAbi,
                address: contractAdress,
                functionName: "getSunWattToken",
                args: [address, Math.floor(energy * 1000)], // Convertit l'énergie en integer
            });

            setTransactionHash(hash); // Stocke le hash de la transaction
            console.log("Transaction envoyée :", result);



        } catch (err) {
            console.error("Erreur lors du mint :", err);
            toast({
                title: "Erreur",
                description: err.message || "Une erreur est survenue.",
                variant: "destructive",
            });
        }
    };

    // Suivi des changements dans la transaction
    useEffect(() => {
        if (isSuccess) {
            toast({
                title: "Succès",
                description: "Transaction confirmée, tokens mintés avec succès.",
                variant: "success",
                className: "bg-green-500 break-all",

            });
            fetchTokenCount(); // Actualise les tokens après une transaction réussie
            fetchMintHistory(); // Actualise l'historique des mints
            checkClientStatus()
            // Réinitialise l'énergie après le mint
            setEnergy(0);
        }

        if (isError) {
            toast({
                title: "Erreur",
                description: error?.message || "Une erreur est survenue lors de la confirmation.",
                variant: "destructive",
            });
        }
    }, [isSuccess, isError, error]);

    const { data: minHistoryData, refetch: fetchMintHistoryContract } = useReadContract({
        abi: contractAbi,
        address: contractAdress,
        functionName: "getMintHistory",
        args: [address]
    });



    const fetchMintHistory = async () => {
        try {
            const result = await fetchMintHistoryContract();
            // console.log("Données brutes retournées :", result);
            console.log("Data from fetchMintHistoryContract:", result);

            if (result.data.length > 0) {
                // Déstructuration des données retournées par le contrat
                const amounts = result.data[0];
                const timestamps = result.data[1];


                // Transformation en un tableau d'objets
                const history = amounts.map((amount, index) => ({
                    date: new Date(Number(timestamps[index]) * 1000).toLocaleString(), // Formater le timestamp
                    tokens: amount.toString(), // Convertir BigNumber en string
                }));

                setMintHistory(history); // Mettre à jour l’état avec l’historique
                console.log("Mint History:", history); // Debugging
            } else {
                console.log("Aucun historique trouvé.");
            }
        } catch (err) {
            console.error("Erreur lors de la récupération de l'historique des mint :", err);
        }
    };
    // Simulation de production d'énergie toutes les 10 secondes
    useEffect(() => {
        const mintable = async () => {

            const res = await fetchClientStatus();
            console.log("tokenmintable", res.data[1]);
            setMaxMintable(res.data[1])
        }
        mintable()
        // console.log(result);

        // const [, maxMintable] = result;
        // setMaxMintable(maxMintable)
        const interval = setInterval(() => {
            generateEnergy();
        }, 10000); // Toutes les 10 secondes

        fetchTokenCount(); // Récupère les tokens existants au démarrage
        fetchMintHistory();
        return () => clearInterval(interval); // Nettoie l'intervalle lors du démontage
    }, []);
    return (
        <div className="flex flex-col items-center w-full mt-10 p-6 bg-gray-50 rounded-lg shadow-lg">
            <h2 className="text-4xl font-bold text-blue-600 mb-6">
                Bienvenue sur votre tableau de bord
            </h2>
            <p className="text-lg text-gray-600 mb-8 text-center">
                Convertissez votre production d'électricité en token pour générer du rendement.
            </p>
            <p className="text-lg text-gray-600 mb-1 text-center">
                Actuellement, votre production d'éléctricité peut vous rapporter jusqu'à:
            </p>
            <p className='my-4 font-bold'>{maxMintable} KWH token / jour</p>

            {/* Sections pour la production et le portefeuille */}
            <div className="flex flex-wrap w-full justify-center gap-6 mb-8">
                <div className="flex flex-col items-center bg-white border border-blue-300 rounded-lg p-6 shadow-md w-64">
                    <h3 className="text-l text-center font-bold text-gray-700 mb-4">Votre production d'électricité</h3>
                    <p className="text-3xl mb-4">⚡</p>
                    {energy > 0 ? (
                        <p className="text-center text-gray-600">
                            Vous avez produit <strong>{energy.toFixed(2)} KwH</strong> depuis la dernière conversion en token.
                        </p>
                    ) : (
                        <p className="text-center text-gray-500">Vous pourrez bientôt voir votre production ici.</p>
                    )}
                </div>

                <div className="flex flex-col items-center bg-white border border-blue-300 rounded-lg p-6 shadow-md w-64">
                    <h3 className="text-l text-center font-bold text-gray-700 mb-4">Nombre de Jetons dans votre portefeuille</h3>
                    <p className="text-4xl mb-4">🪙</p>
                    {tokenCount > 0 ? (
                        <p className="text-center text-gray-600">
                            Vous avez actuellement <strong>{tokenCount}</strong> tokens dans votre portefeuille.
                        </p>
                    ) : (
                        <p className="text-center text-gray-500">Vous pourrez bientôt voir vos tokens gagnés ici.</p>
                    )}
                </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-4 mb-8">
                <Button
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow"
                    onClick={handleMint}
                    disabled={!energy}
                >
                    Mint de votre production
                </Button>
                <Button
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg shadow"
                    onClick={fetchTokenCount}
                    disabled={!tokenCount}
                >
                    Actualiser votre portefeuille
                </Button>
            </div>

            {/* Historique des Mint */}
            <div className="w-full max-w-4xl">
                <h3 className="text-2xl font-bold text-gray-700 mb-4">Historique des Mint</h3>
                {mintHistory.length > 0 ? (
                    <ul className="bg-white rounded-lg shadow-md divide-y divide-gray-200">
                        {mintHistory.map((mint, index) => (
                            <li key={index} className="flex justify-between items-center px-4 py-2">
                                <p className="text-gray-600">
                                    <strong>Tokens minted :</strong> {mint.tokens}
                                </p>
                                <p className="text-gray-600">
                                    <strong>Date :</strong> {mint.date}
                                </p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-center">
                        Aucun mint effectué pour le moment.
                    </p>
                )}
            </div>
        </div>
    );
};

export default EnergyCounter;