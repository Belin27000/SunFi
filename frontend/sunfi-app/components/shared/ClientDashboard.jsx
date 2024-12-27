'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { contractAbi, contractAdress } from '@/app/constants/index.js';
import { useToast } from "@/hooks/use-toast";

const EnergyCounter = () => {
    const { address, isConnected } = useAccount(); // Vérifie si l'utilisateur est connecté
    const [energy, setEnergy] = useState(0);
    const [transactionHash, setTransactionHash] = useState(null);
    const [tokenCount, setTokenCount] = useState(0);
    const [isClientLoading, setIsClientLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);
    const [mintHistory, setMintHistory] = useState([]);


    const { toast } = useToast();

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
        enable: false,
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
        const interval = setInterval(() => {
            generateEnergy();
        }, 10000); // Toutes les 10 secondes

        fetchTokenCount(); // Récupère les tokens existants au démarrage
        fetchMintHistory();
        return () => clearInterval(interval); // Nettoie l'intervalle lors du démontage
    }, []);
    return (
        <div className='flex flex-col'>
            <h2 className='text-2xl text-center font-bold py-5'>Bienvenue sur votre tableau de bord</h2>
            <p>Convertissez votre production d'électricité en token pour générer du rendement.</p>
            <div className='flex w-full justify-between my-4 gap-2'>
                <div className='border-solid border-2 border-blue-300 rounded-md w-1/2 text-center py-4'>
                    <h3 className='text-2xl font-bold'>Votre production d'électricité</h3>
                    <p className='text-2xl'>⚡</p>
                    {energy > 0 ? (
                        <>
                            <p>Vous avez produit {energy.toFixed(2)} KwH</p>
                            <p>Depuis la dernière conversion en token</p>
                        </>
                    ) : (
                        <>
                            <p>Vous pourrez bientôt voir votre production ici</p>
                        </>
                    )}
                </div>
                <div className='border-solid border-2 border-blue-300 rounded-md w-1/2 text-center py-4'>
                    <h3 className='text-2xl font-bold'>Nombre de Jetons dans votre portefeuille</h3>
                    <p className='text-4xl'>🪙</p>
                    {(tokenCount > 0) ? (
                        <p>
                            Vous avez actuellement {tokenCount} tokens dans votre portefeuille
                        </p>) :
                        (
                            <p>Vous pourrez bientôt voir vos tokens gagné ici</p>

                        )}
                </div>
            </div>
            <div className='flex justify-center gap-2'>
                <Button className='bg-blue-500 w-1/2 text-black font-bold' onClick={handleMint} disabled={!energy}>
                    Mint de votre production
                </Button>
                <Button className='bg-red-500 w-1/2 text-black font-bold' onClick={fetchTokenCount} disabled={!tokenCount}>
                    Actualiser votre portefeuille
                </Button>
            </div>
            <div className="my-4">
                <h3 className="text-xl font-bold">Historique des Mint</h3>

                {mintHistory.length > 0 ? (
                    <ul >
                        {mintHistory.map((mint, index) => (
                            <li key={index} className="flex justify-between border p-2 my-2 rounded-md shadow">
                                <p><strong>Tokens minted :</strong> {mint.tokens}</p>
                                <p><strong>Date :</strong> {mint.date}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Aucun mint effectué pour le moment</p>
                )}

            </div>
        </div>
    );
};

export default EnergyCounter;