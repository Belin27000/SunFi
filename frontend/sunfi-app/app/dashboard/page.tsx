'use client';
export const dynamic = 'force-dynamic';
import NotConnected from "../../components/shared/NotConnected";
import SunFi from "@/components/shared/SunFi";
import Client from "@/components/shared/ClientDashboard";
import { getAddress } from "ethers";
import { useAccount, useReadContract } from "wagmi";
import { contractAbi, contractAdress } from "@/app/constants/index";
export default function Dashboard() {
    const { address, isConnected } = useAccount();

    // Valider et normaliser l'adresse du contrat
    if (!contractAdress || typeof contractAdress !== "string") {
        throw new Error("Invalid contract address");
    }
    const normalizedContractAddress = contractAdress as `0x${string}`;

    // Valider et normaliser l'adresse utilisateur
    const normalizedAddress = address && typeof address === "string" ? address : null;

    // Récupérez si l'adresse connectée est un client enregistré
    const { data: isRegisteredClient, isLoading: isLoadingClient, isError: isErrorClient } = useReadContract({
        abi: contractAbi,
        address: normalizedContractAddress,
        functionName: "getClient",
        args: [normalizedAddress],
    });

    // Récupérez l'adresse du propriétaire du contrat
    const { data: ownerAddress, isLoading: isLoadingOwner, isError: isErrorOwner } = useReadContract({
        abi: contractAbi,
        address: normalizedContractAddress,
        functionName: "owner",
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
    const normalizedOwnerAddress = ownerAddress && typeof ownerAddress === "string"
        ? ownerAddress
        : null;
    if (!normalizedOwnerAddress) {
        console.error("Owner address is invalid or missing");
    }
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
    if (!isRegisteredClient || !Array.isArray(isRegisteredClient) || isRegisteredClient[0] === false) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Vous n'êtes pas enregistré comme client. Veuillez contacter l&apos;'administrateur.</p>
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