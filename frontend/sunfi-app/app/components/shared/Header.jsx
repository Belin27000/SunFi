import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from "next/link.js"

export const Header = () => {
    return (
        <nav className="navbar flex flex-col  md:flex-row justify-between items-center mx-auto px-4 sm:px-6 lg:px-8 xl:max-w-7xl 2xl:max-w-screen-xl">
            <div className="Logo">Logo</div>
            <nav className="navbar flex grow justify-center space-x-4">
                <Link href="/">Présentation</Link>
                <Link href="/Roadmap">Roadmap</Link>
                <Link href="/App">DApp</Link>
                <Link href="/Contact">Contact</Link>
            </nav>
            <div>
                <ConnectButton />
            </div>
        </nav>
    )
}
