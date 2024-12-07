'use client'
import NotConnected from "../../components/shared/NotConnected";
import Sunfi from "../../components/shared/SunFi";

import { useAccount } from "wagmi";
export default function Dashboard() {
    const { isConnected } = useAccount()
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex items-center justify-center">
                {isConnected ? (
                    <Sunfi />
                ) :
                    <NotConnected />
                }
            </main>
        </div>
    )
}
