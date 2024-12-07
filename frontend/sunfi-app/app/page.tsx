import Image from "next/image";
import SolarPanelHouse from "../public/images/SolarPanelHouse2.jpg"
import SolarPanelHouse2 from "../public/images/SolarPanelHouse3.jpg"
import SolarPanel from "../public/images/SolarPanel.jpg"
import Link from "next/link.js"

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center">
        Valorisez votre production d&apos;énergie sans attendre
      </h1>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="article1">
          <div className="bg-white relative">
            <Image
              className="rounded-xl"
              src={SolarPanelHouse}
              alt="Maison avec des panneaux solaires sur le toit"
              objectFit="cover"
            />
          </div>
          <p className="text-center mt-5 text-lg sm:text-xl md:text-2xl">
            Bénéficiez de l&apos;offre de revente de votre surplus de production photovoltaïque
          </p>
          <p className="text-center mt-5 text-lg sm:text-xl md:text-2xl">
            Nous nous engageons pour la démocratisation de la production d&apos;énergie et nous vous rachètons votre surplus !
          </p>
          <div className="flex justify-between h-full w-full mt-10">
            <div className="text-center text-sm sm:text-base md:text-lg lg:text-xl w-2/3 flex flex-col justify-evenly">
              <p>Que vous ayez un contrat d&apos;électricité chez NOUS ou non, nous vous rachetons votre excédent de production solaire.</p>
              <p className="text-xl sm:text-2xl md:text-3xl text-center">
                Prix de rachat du kWh jusqu&apos;à 7ct d&apos;€
              </p>
            </div>
            <div className="w-1/3">
              <Image
                className="rounded-xl"
                src={SolarPanel}
                alt="Maison avec des panneaux solaires sur le toit"
                objectFit="cover"
              />
            </div>
          </div>
        </div>
        <h2 className="uppercase text-center w-full text-sm sm:text-base md:text-lg lg:text-4xl font-bold text-lime-600">placer votre surplus de production</h2>
        <div className="text-sm sm:text-base md:text-lg lg:text-4xl">Nous créons des solutions financières innovantes pour concrétiser vos projets, optimiser vos placements et personnaliser vos investissements</div>
        <div className="flex shadow-2xl shadow-yellow-300 rounded-md">
          <Image
            className="w-1/2 rounded-l-lg"
            src={SolarPanelHouse2}
            alt="Maison avec des panneaux solaires sur le toit"
            objectFit="cover"
          />
          <div className="w-1/2">
            <div className="mx-20">
              <p className="text-xl mt-4">Nous estimons que chaque personne mérite de créer son avenir. </p>
              <p className="font-bold text-center text-xl mt-4">acheter une nouvelle voiture, un futur voyage,ou un placement pour la retraite </p>
              <Link className="hover:bg-black hover:text-white flex border-2 uppercase rounded-sm border-black mt-5 justify-center  text-center" href="/dashboard">nos placements</Link>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
