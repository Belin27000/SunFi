import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from "next/link.js"
import Logo from "../../public/images/Logo.png"
import Image from "next/image";


export const Header = () => {
    return (
        <div className="pt-2 navbar flex flex-col  md:flex-row justify-between items-center mx-auto px-4 sm:px-6 lg:px-8 xl:max-w-7xl 2xl:max-w-screen-xl">
            <div className="Logo h-16 w-16 md:h-20 nd:w-20 flex-col relative content-center">
                <Image

                    src={Logo}
                    alt="Maison avec des panneaux solaires sur le toit"
                    objectFit="cover"
                />
            </div>
            <nav className=" navbar flex grow justify-evenly space-x-4 font-bold">
                <Link className='hover:bg-black hover:text-white p-2' href="/">Présentation</Link>
                <Link className='hover:bg-black hover:text-white p-2' href="/Roadmap">Roadmap</Link>
                <Link className='hover:bg-black hover:text-white p-2' href="/dashboard">Tableau de bord</Link>
                <Link className='hover:bg-black hover:text-white p-2' href="/Contact">Contact</Link>
            </nav>
            <div>
                <ConnectButton />
            </div>
        </div>
    )
}
