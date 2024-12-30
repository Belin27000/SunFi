import Image from "next/image";
import SolarPanelHouse from "../public/images/SolarPanelHouse2.jpg";
import SolarPanelHouse2 from "../public/images/SolarPanelHouse3.jpg";
import SolarPanel from "../public/images/SolarPanel.jpg";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans p-8 sm:p-12">
      {/* Titre principal */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center text-gray-800 mb-12">
        Valorisez votre production d&apos;énergie sans attendre
      </h1>

      {/* Section principale */}
      <main className="space-y-12">
        {/* Section 1 */}
        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2">
            <Image
              className="rounded-lg"
              src={SolarPanelHouse}
              alt="Maison avec des panneaux solaires sur le toit"
              objectFit="cover"
            />
          </div>
          <div className="md:w-1/2 mt-8 md:mt-0 md:pl-12">
            <p className="text-xl text-gray-700 mb-4">
              Bénéficiez de l&apos;offre de revente de votre surplus de production
              photovoltaïque.
            </p>
            <p className="text-xl text-gray-700">
              Nous nous engageons pour la démocratisation de la production
              d&apos;énergie et nous vous rachetons votre surplus !
            </p>
            <p className="text-3xl text-blue-600 font-bold mt-8">
              Prix de rachat du kWh jusqu&apos;à 7ct d&apos;€
            </p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="space-y-6">
          <h2 className="text-center text-3xl font-bold uppercase text-lime-600">
            Placer votre surplus de production
          </h2>
          <p className="text-lg text-center text-gray-700">
            Nous créons des solutions financières innovantes pour concrétiser
            vos projets, optimiser vos placements et personnaliser vos
            investissements.
          </p>
          <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="md:w-1/2">
              <Image
                className="h-full w-full object-cover"
                src={SolarPanelHouse2}
                alt="Maison avec des panneaux solaires"
              />
            </div>
            <div className="md:w-1/2 p-6 flex flex-col justify-center">
              <p className="text-xl text-gray-800 mb-4">
                Nous estimons que chaque personne mérite de créer son avenir.
              </p>
              <p className="text-xl font-bold text-gray-800 text-center mb-8">
                Acheter une nouvelle voiture, un futur voyage, ou un placement
                pour la retraite.
              </p>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-blue-600 text-white text-center uppercase font-bold rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Nos placements
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}