'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { contractAbi, contractAdress } from '@/app/constants/index.js';
import { useToast } from "@/hooks/use-toast";

const EnergyCounter = () => {
    const { address, isConnected } = useAccount(); // Vérifie si l'utilisateur est connecté
    const [energy, setEnergy] = useState(.2);
    const [transactionHash, setTransactionHash] = useState(null);
    const [tokenCount, setTokenCount] = useState(0);

    const { toast } = useToast();

    // Lecture des tokens mintés
    const { refetch } = useReadContract({
        abi: contractAbi,
        address: contractAdress,
        functionName: "getTotalMinted",
        args: [address],
    });

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

    // Fonction pour récupérer et mettre à jour le nombre de jetons
    const fetchTokenCount = async () => {
        try {
            const result = await refetch();
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

            // Réinitialise l'énergie après le mint
            setEnergy(0);
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
        }

        if (isError) {
            toast({
                title: "Erreur",
                description: error?.message || "Une erreur est survenue lors de la confirmation.",
                variant: "destructive",
            });
        }
    }, [isSuccess, isError, error]);

    // Simulation de production d'énergie toutes les 10 secondes
    useEffect(() => {
        const interval = setInterval(() => {
            generateEnergy();
        }, 10000); // Toutes les 10 secondes

        fetchTokenCount(); // Récupère les tokens existants au démarrage

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
                    <p>Vous avez produit {energy.toFixed(2)} KwH</p>
                    <p>Depuis la dernière conversion en token</p>
                </div>
                <div className='border-solid border-2 border-blue-300 rounded-md w-1/2 text-center py-4'>
                    <h3 className='text-2xl font-bold'>Nombre de Jetons dans votre portefeuille</h3>
                    <p className='text-4xl'>🪙</p>
                    Vous avez actuellement {tokenCount} tokens dans votre portefeuille
                </div>
            </div>
            <div className='flex justify-center gap-2'>
                <Button className='bg-blue-500 w-1/2 text-black font-bold' onClick={handleMint} disabled={energy === 0}>
                    Mint de votre production
                </Button>
                <Button className='bg-red-500 w-1/2 text-black font-bold' onClick={fetchTokenCount}>
                    Actualiser votre portefeuille
                </Button>
            </div>
        </div>
    );
};

export default EnergyCounter;