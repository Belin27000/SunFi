'use client'

import { useEffect, useState } from "react";
// import { CheckCircle, PlusCircle, Trash } from "react-feather";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { contractAdress, contractAbi } from "@/app/constants/index.js";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { publicClient } from "@/utils/client.js";
import { CheckCircle, PlusCircle, Trash } from "lucide-react";


const SunFi = () => {
    const { address } = useAccount();
    const [addr, setAddr] = useState("");
    const [maxMintable, setMaxMintable] = useState(0);
    const { toast } = useToast();
    const [operation, setOperation] = useState(null);
    const [clientInfo, setClientInfo] = useState(null)
    const [totalMinted, setTotalMinted] = useState(null)


    const { data, refetch } = useReadContract({
        abi: contractAbi,
        address: contractAdress,
        functionName: 'getClient',
        args: [addr],
        enable: false,
    })
    const { data: totalMintedData, refetch: refetchMinted } = useReadContract({
        abi: contractAbi,
        address: contractAdress,
        functionName: 'getTotalMinted',
        args: [addr],
    });
    const { writeContract, data: hash, isPending: SetIsPending } = useWriteContract({
    });
    const { isLoading: isConfirming, isSuccess, isError, error } = useWaitForTransactionReceipt({ hash })

    const handleCheckClient = async () => {
        setClientInfo(null)
        try {
            const { data } = await refetch();
            const totalMintedData = await refetchMinted();
            console.log("mintData", totalMintedData.data);

            if (data && Array.isArray(data)) {
                const [isRegistered, maxMintable] = data;


                setClientInfo({
                    isRegistered,
                    maxMintable,
                });
                setTotalMinted(totalMintedData.data)
                if (isRegistered) {
                    toast({
                        title: "Adresse enregistrée",
                        description: `L'adresse ${addr} est déjà enregistrée.`,
                        variant: "success",
                        className: "bg-green-500 break-all",
                    });
                }
            } else {
                toast({
                    title: "Adresse non enregistrée",
                    description: `L'adresse ${addr} n'est pas dans la liste des clients.`,
                    className: "bg-orange-500 break-all",
                });
            }
        } catch (error) {
            setClientInfo(null);
            toast({
                title: "Erreur de vérification",
                description: error.message || "Une erreur inconnue est survenue.",
                variant: "destructive",
                className: "bg-red-500 break-all",
            });
        }
    };
    const handleAddClient = async () => {
        setOperation("add");
        try {
            const maxMintableValue = parseInt(maxMintable, 10);
            if (isNaN(maxMintableValue) || maxMintableValue <= 0) {
                throw new Error("Veuillez entrer un nombre valide pour le nombre maximum de tokens mintables.");
            }
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
                args: [addr, maxMintable], // Arguments nécessaires pour la fonction Solidity
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
        setOperation("delete");
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
    }
    useEffect(() => {
        if (isSuccess) {
            if (operation === "add") {
                toast({
                    title: 'Succès',
                    description: `L'adresse ${addr} a été enregistrée avec succès.`,
                    variant: 'success',
                    className: 'bg-green-500 break-all',
                });
            } else if (operation === "delete") {
                toast({
                    title: 'Succès',
                    description: `L'adresse ${addr} a été supprimée avec succès.`,
                    variant: 'success',
                    className: 'bg-green-500 break-all',
                });
            }
            setOperation(null); // Réinitialiser l'opération après succès
        }

        if (isError) {
            toast({
                title: 'Erreur de confirmation',
                description: error?.message || 'Une erreur est survenue lors de la confirmation.',
                variant: 'destructive',
                className: 'bg-red-500 break-all',
            });
            setOperation(null); // Réinitialiser l'opération après erreur
        }
    }, [isSuccess, isError, error, addr, operation, toast]);

    return (
        <div className="flex flex-col items-center w-full mt-10 p-8 bg-gray-50 rounded-lg shadow-lg">
            <h2 className="mb-8 text-4xl font-bold text-blue-600">
                Administration des clients
            </h2>

            {/* Vérifier si une adresse est déjà un client */}
            <div className="w-full max-w-md mb-6">
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                    Vérifier si une adresse est déjà un client
                </label>
                <div className="flex flex-col items-center">
                    <Input
                        placeholder="Entrez l'adresse à vérifier"
                        className="flex-grow  mb-2"
                        onChange={(e) => setAddr(e.target.value)}
                    />
                    <Button
                        className="flex items-center px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow"
                        onClick={handleCheckClient}
                    >
                        <CheckCircle className="mr-2" />
                        Vérifier
                    </Button>
                </div>
            </div>
            {clientInfo && (
                <div className="my-2 p-4 bg-white rounded-lg shadow border border-gray-200">
                    {clientInfo.isRegistered ? (
                        <>
                            <p className="text-lg font-semibold text-green-600">
                                L'adresse est enregistrée.
                            </p>
                            <p className="text-sm text-gray-700">
                                Nombre maximum de tokens mintables par jour : <span className="font-bold">{clientInfo.maxMintable} KWH token</span>
                            </p>
                            <p className="text-sm text-gray-700">
                                Nombre de tokens de l'adresse: <span className="font-bold">{totalMinted} KWH token</span>
                            </p>
                        </>
                    ) : (
                        <p className="text-lg font-semibold text-red-600">
                            L'adresse n'est pas enregistrée.
                        </p>
                    )}
                </div>
            )}

            {/* Ajouter une adresse client */}
            <div className="w-full max-w-md mb-6 flex flex-col">
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                    Ajouter une adresse client
                </label>
                <div className="flex flex-col items-center">
                    <label htmlFor="clientAddress" className="w-full text-left  text-sm font-medium text-gray-600 mb-1">
                        Adresse client
                    </label>
                    <Input
                        id="clientAddress"
                        placeholder="Entrez l'adresse à ajouter"
                        className="flex-grow mb-2"
                        onChange={(e) => setAddr(e.target.value)}
                    />
                    <label htmlFor="maxTokens" className="w-full text-left text-sm font-medium text-gray-600 mb-1">
                        Nombre Max de tokens mintables
                    </label>
                    <Input
                        id="maxTokens"
                        placeholder="Nombre Max de token mintable: default 0"
                        className="flex-grow  mb-2 text-lg"
                        onChange={(e) => setMaxMintable(e.target.value)}
                    />
                    <Button
                        className="flex items-center px-6 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow"
                        onClick={handleAddClient}
                    >
                        <PlusCircle className="mr-2" />
                        Ajouter
                    </Button>
                </div>
            </div>

            {/* Supprimer une adresse client */}
            <div className="w-full max-w-md mb-6">
                <label className="block text-lg font-semibold text-gray-700 mb-2">
                    Supprimer une adresse client
                </label>
                <div className="flex flex-col items-center">
                    <Input
                        placeholder="Entrez l'adresse à supprimer"
                        className="flex-grow  mb-2"
                        onChange={(e) => setAddr(e.target.value)}
                    />
                    <Button
                        className="flex items-center px-6 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow"
                        onClick={handleDeleteClient}
                    >
                        <Trash className="mr-2" />
                        Supprimer
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SunFi;