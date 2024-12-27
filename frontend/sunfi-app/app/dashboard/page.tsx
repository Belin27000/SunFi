'use client';
import NotConnected from "../../components/shared/NotConnected";
import Sunfi from "../../components/shared/SunFi";
import Client from "../../components/shared/ClientDashboard";
import { getAddress } from "ethers";
import { useAccount, useReadContract } from "wagmi";
import { contractAbi, contractAdress } from "../constants";

export default function Dashboard() {
    const { address, isConnected } = useAccount();

    // Normalisez l'adresse du contrat (toujours appelé)
    const normalizedContractAddress = getAddress(contractAdress);

    // Récupérez l'adresse du propriétaire depuis le contrat
    const { data: ownerAddress, isLoading, isError } = useReadContract({
        abi: contractAbi,
        address: normalizedContractAddress,
        functionName: "owner",
        enabled: isConnected, // Active le hook seulement si connecté
    });

    // Vérification si l'utilisateur est connecté
    if (!isConnected) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <NotConnected />
            </div>
        );
    }

    // Gestion des états de chargement et d'erreur
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Chargement...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Erreur lors de la récupération de l'owner.</p>
            </div>
        );
    }

    // Vérifiez si l'adresse correspond à l'owner ou affichez le client
    const normalizedAddress = address ? getAddress(address) : null;
    const normalizedOwnerAddress = ownerAddress ? getAddress(ownerAddress) : null;

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex items-center justify-center">
                {normalizedAddress === normalizedOwnerAddress ? (
                    <Sunfi />
                ) : (
                    <Client />
                )}
            </main>
        </div>
    );
}