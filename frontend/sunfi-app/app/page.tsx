import Image from "next/image";
import SolarPanelHouse from "../public/images/SolarPanelHouse2.jpg"
import SolarPanel from "../public/images/SolarPanel.jpg"
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
            <div className="text-center text-sm sm:text-base md:text-lg lg:text-xl w-2/3 flex flex-col grow">
              <p>Que vous ayez un contrat électricité chez NOUS ou non, nous vous rachetons votre excédent de production solaire.</p>
              <p className="text-xl sm:text-2xl md:text-3xl text-center">
                Prix de rachat du kWh 7ct d&apos;€
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
      </main>
    </div>
  );
}
