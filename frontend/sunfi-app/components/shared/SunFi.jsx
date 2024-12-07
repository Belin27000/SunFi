'use client'


import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { contractAdress, contractAbi } from "@/app/constants/index.js"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi"
import { parseAbiItem } from "viem"
import { publicClient } from "@/utils/client.js"


const SunFi = () => {
    const { address } = useAccount();
    const [addr, setAddr] = useState()
    const [isChecking, setIsChecking] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [verificationError, setVerificationError] = useState(null);
    const [hasChecked, setHasChecked] = useState(false);


    const { toast } = useToast()

    // Ajoute une nouvelle adresse
    const { data: hash, error, isPending: setIsPending, writeContract } = useWriteContract({
    });

    // Fonction pour vérifier si une adresse est enregistrée
    const checkClient = async () => {
        setIsChecking(true);
        setVerificationError(null);
        setIsClient(false);
        setHasChecked(true);


        try {
            const result = await publicClient.readContract({
                address: contractAdress,
                abi: contractAbi,
                functionName: 'getClient',
                args: [addr],
            });
            setIsClient(result);
            console.log("Client status:", result);
        } catch (err) {
            console.error("Error during client check:", err);
            setVerificationError(err.message || "Une erreur s'est produite !");
        } finally {
            setIsChecking(false);
        }
    };
    const handleAddClient = async () => {
        console.log("Contract Address:", contractAdress);
        console.log("Address to Add:", addr);
        console.log("ABI:", contractAbi);

        writeContract({
            address: contractAdress,
            abi: contractAbi,
            functionName: 'addClient',
            args: [addr],
        })


    };

    const { isLoading: isConfirming, isSuccess, error: errorConfirmation } =
        useWaitForTransactionReceipt({
            hash
        });

    return (
        <div className="flex flex-col w-full justify-start mt-10">
            <h2 className="mb-4 text-4xl">Adminstration des clients</h2>
            <div className="my-4">
                Vérifier si une adresse est déjà un client
            </div>
            <div className="flex">
                <Input
                    placeholder="Entrez l'adresse à vérifier"
                    onChange={(e) => setAddr(e.target.value)}
                />
                <Button className="ml-10" onClick={checkClient}>
                    {isChecking ? "Vérification..." : "Vérifier"}
                </Button>
            </div>
            {isChecking && (
                <Alert className="bg-amber-500 mt-2">
                    <AlertTitle>Vérification en cours</AlertTitle>
                    <AlertDescription>
                        L'adresse {addr} est en cours de vérification.
                    </AlertDescription>
                </Alert>
            )}
            {verificationError && (
                <Alert className="bg-red-600 mt-2">
                    <AlertTitle>Erreur de vérification</AlertTitle>
                    <AlertDescription>{verificationError}</AlertDescription>
                </Alert>
            )}
            {isClient && (
                <Alert className="bg-lime-400 mt-2">
                    <AlertTitle>Adresse enregistrée</AlertTitle>
                    <AlertDescription>
                        L'adresse <span className="bg-black text-white p-2">{addr}</span> est déjà enregistrée.
                    </AlertDescription>
                </Alert>
            )}
            {hasChecked && !isClient && addr && !isChecking && !verificationError && (
                <Alert className="bg-gray-400 mt-2">
                    <AlertTitle>Adresse non enregistrée</AlertTitle>
                    <AlertDescription>
                        L'adresse <span className="bg-black text-white p-2">{addr}</span> n'est pas dans la liste des clients.
                    </AlertDescription>
                </Alert>
            )}

            <div className="my-4">
                Ajouter une adresse client
            </div>
            <div className="flex">
                <Input placeholder="Entrez l'adresse à ajouter" onChange={(e) => { setAddr(e.target.value) }} />
                <Button className="ml-10" disabled={setIsPending} onClick={handleAddClient}>{setIsPending ? 'Ajout en cours...' : "Ajouter"}</Button>
            </div>
            {isConfirming &&
                <Alert className="bg-amber-500 mt-2">
                    <AlertTitle>Adresse en cour d'enregistrement</AlertTitle>
                    <AlertDescription>
                        L'adresse {addr} est en cours d'enregistrement
                    </AlertDescription>
                </Alert>

            }
            {isSuccess &&
                <Alert className="bg-lime-400 mt-2">
                    <AlertTitle className="mb-4">Adresse enregistrée</AlertTitle>
                    <AlertDescription>
                        <p>L'adresse <span className="bg-black text-white p-2">{addr}</span> a été enregistré avec succès</p>
                        <p className="mt-4">Transaction hash: {hash}</p>
                    </AlertDescription>
                </Alert>
            }
            {errorConfirmation &&
                <Alert className="bg-red-600 mt-2">
                    <AlertTitle className="mb-4">Error d'enregistrement</AlertTitle>
                    <AlertDescription>
                        {(errorConfirmation).shortMessage || errorConfirmation.message}
                    </AlertDescription>
                </Alert>
            }
        </div >
    )
}

export default SunFi