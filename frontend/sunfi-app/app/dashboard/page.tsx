'use client'
import NotConnected from "../../components/shared/NotConnected";
import Sunfi from "../../components/shared/SunFi";
import Client from "../../components/shared/ClientDashboard";
import { getAddress } from "ethers";
import { useAccount, useReadContract } from "wagmi";
import { contractAbi, contractAdress } from "../constants";


export default function Dashboard() {
    const { address, isConnected } = useAccount()
    const normalizedContractAddress = getAddress(contractAdress)

    const { data: ownerAddress, isLoading, isError } = useReadContract({
        abi: contractAbi,
        address: normalizedContractAddress,
        functionName: "owner"
    })
    if (isLoading) {
        return <p>Chargement...</p>
    }
    if (isError) {
        return <p>Erreur lors de la récupération de l'owner.</p>
    }
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex items-center justify-center">
                {isConnected ? (
                    address === ownerAddress ? (
                        <Sunfi />

                    ) : (
                        <Client />
                    )
                ) :
                    <NotConnected />
                }
            </main>
        </div>
    )
}
