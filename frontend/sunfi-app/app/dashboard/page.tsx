'use client';
import NotConnected from "../../components/shared/NotConnected";
import SunFi from "@/components/shared/SunFi";
import Client from "@/components/shared/ClientDashboard";
import { getAddress } from "ethers";
import { useAccount, useReadContract } from "wagmi";
import { contractAbi, contractAdress } from "../constants";

export default function Dashboard() {
    const { address, isConnected } = useAccount();

    // Normalisez l'adresse de l'utilisateur connecté et du contrat
    const normalizedContractAddress = getAddress(contractAdress);
    const normalizedAddress = address ? getAddress(address) : null;

    // Récupérez si l'adresse connectée est un client enregistré
    const { data: isRegisteredClient, isLoading: isLoadingClient, isError: isErrorClient } = useReadContract({
        abi: contractAbi,
        address: normalizedContractAddress,
        functionName: "getClient",
        args: [normalizedAddress],
        enabled: !!normalizedAddress,
    });

    // Récupérez l'adresse du propriétaire du contrat
    const { data: ownerAddress, isLoading: isLoadingOwner, isError: isErrorOwner } = useReadContract({
        abi: contractAbi,
        address: normalizedContractAddress,
        functionName: "owner",
        enabled: isConnected,
    });

    // Affichage si l'utilisateur n'est pas connecté
    if (!isConnected) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <NotConnected />
            </div>
        );
    }

    // Affichage pendant le chargement des données (client ou propriétaire)
    if (isLoadingClient || isLoadingOwner) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Chargement...</p>
            </div>
        );
    }

    // Affichage en cas d'erreur (client ou propriétaire)
    if (isErrorClient && isErrorOwner) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Erreur lors de la récupération des informations.</p>
            </div>
        );
    }

    // Vérifiez si l'utilisateur connecté est le propriétaire du contrat
    const normalizedOwnerAddress = ownerAddress ? getAddress(ownerAddress) : null;
    if (normalizedAddress === normalizedOwnerAddress) {
        return (
            <div className="flex flex-col min-h-screen">
                <main className="flex items-center justify-center">
                    <SunFi />
                </main>
            </div>
        );
    }

    // Vérifiez si l'utilisateur est un client enregistré
    if (!isRegisteredClient || isRegisteredClient[0] === false) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Vous n'êtes pas enregistré comme client. Veuillez contacter l'administrateur.</p>
            </div>
        );
    }

    // Si l'utilisateur est enregistré comme client, affichez le tableau de bord client
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex items-center justify-center">
                <Client />
            </main>
        </div>
    );
}