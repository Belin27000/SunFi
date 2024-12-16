'use client'

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { contractAdress, contractAbi } from "@/app/constants/index.js";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { publicClient } from "@/utils/client.js";

const SunFi = () => {
    const { address } = useAccount();
    const [addr, setAddr] = useState("");
    const { toast } = useToast();
    const [deletionAddr, setDeletionAddr] = useState(false)

    const { data, refetch } = useReadContract({
        abi: contractAbi,
        address: contractAdress,
        functionName: 'getClient',
        args: [addr],
        enable: false,
    })
    const { writeContract, data: hash, isPending: SetIsPending } = useWriteContract({
    });
    const { isLoading: isConfirming, isSuccess, isError, error } = useWaitForTransactionReceipt({
        hash
    })

    const handleCheckClient = async () => {
        try {
            const { data } = await refetch();

            if (data) {
                toast({
                    title: "Adresse enregistrée",
                    description: `L'adresse ${addr} est déjà enregistrée.`,
                    variant: "success",
                    className: "bg-green-500 break-all",
                });
            } else {
                toast({
                    title: "Adresse non enregistrée",
                    description: `L'adresse ${addr} n'est pas dans la liste des clients.`,
                    className: "bg-orange-500 break-all",
                });
            }
        } catch (error) {
            toast({
                title: "Erreur de vérification",
                description: error.message || "Une erreur inconnue est survenue.",
                variant: "destructive",
                className: "bg-red-500 break-all",
            });
        }
    };
    const handleAddClient = async () => {
        try {
            toast({
                title: 'Enregistrement en cours',
                description: `L'adresse ${addr} est en cours d'enregistrement.`,
                variant: 'default',
                className: "break-all"
            })
            // Appelle la fonction `addClient` du contrat
            const result = await writeContract({
                abi: contractAbi,
                address: contractAdress,
                functionName: 'addClient',
                args: [addr], // Arguments nécessaires pour la fonction Solidity
            });
            console.log('Transaction envoyée :', hash);
            toast({
                title: "En attente de confirmation",
                description: `Transaction envoyée. Hash : ${hash}`,
                className: "break-all"
            });
        } catch (err) {
            toast({
                title: 'Erreur',
                description: err.message || "Une erreur est survenue.",
                variant: 'destructive'
            })

        }
    }
    const handleDeleteClient = async () => {
        setDeletionAddr(true)
        try {
            toast({
                title: 'Suppression en cours',
                description: `L'adresse ${addr} est en cours de suppression.`,
                variant: 'default',
                className: "break-all"
            })
            // Appelle la fonction `addClient` du contrat
            const result = await writeContract({
                abi: contractAbi,
                address: contractAdress,
                functionName: 'deleteClient',
                args: [addr], // Arguments nécessaires pour la fonction Solidity
            });
            console.log('Transaction envoyée :', hash);
            toast({
                title: "En attente de confirmation",
                description: `Transaction envoyée. Hash : ${hash}`,
                className: "break-all"
            });
        } catch (err) {
            toast({
                title: 'Erreur',
                description: err.message || "Une erreur est survenue.",
                variant: 'destructive',
                className: "break-all"
            })

        }
        setDeletionAddr(false)

    }
    useEffect(() => {
        if (isSuccess) {
            if (deletionAddr) {
                toast({
                    title: 'Succès',
                    description: `L'adresse ${addr} a été enregistrée avec succès`,
                    variant: 'success',
                    className: 'bg-green-500 break-all'
                })
            } else {
                toast({
                    title: 'Succès',
                    description: `L'adresse ${addr} a été supprimée avec succès`,
                    variant: 'success',
                    className: 'bg-green-500 break-all'
                })
            }
        }
        if (isError) {
            toast({
                title: 'Erreur de confirmation',
                description: error?.message || 'Une erreur est survenue lors de la confirmation.',
                variant: 'destructive',
                className: 'bg-red-500 break-all'
            })
        }
    }, [isSuccess, isError, error])

    return (
        <div className="flex flex-col w-full justify-start mt-10">
            <h2 className="mb-4 text-4xl">Administration des clients</h2>

            <div className="my-4">Vérifier si une adresse est déjà un client</div>
            <div className="flex">
                <Input placeholder="Entrez l'adresse à vérifier" onChange={(e) => setAddr(e.target.value)} />
                <Button className="ml-10" onClick={handleCheckClient}>Vérifier</Button>
            </div>
            <div className="my-4">Ajouter une adresse client</div>
            <div className="flex">
                <Input placeholder="Entrez l'adresse à ajouter" onChange={(e) => setAddr(e.target.value)} />
                <Button className="ml-10" onClick={handleAddClient}>Ajouter</Button>
            </div>


            <div className="my-4">Supprimer une adresse client</div>
            <div className="flex">
                <Input placeholder="Entrez l'adresse à supprimer" onChange={(e) => setAddr(e.target.value)} />
                <Button className="ml-10" onClick={handleDeleteClient}>Supprimer</Button>
            </div>
        </div>
    );
};

export default SunFi;