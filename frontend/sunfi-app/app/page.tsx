// import Image from "next/image";
// import SolarPanelHouse from "../public/images/SolarPanelHouse2.jpg"
// import SolarPanelHouse2 from "../public/images/SolarPanelHouse3.jpg"
// import SolarPanel from "../public/images/SolarPanel.jpg"
// import Link from "next/link.js"

// export default function Home() {
//   return (
//     <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
//       <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center">
//         Valorisez votre production d&apos;énergie sans attendre
//       </h1>
//       <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
//         <div className="article1">
//           <div className="bg-white relative">
//             <Image
//               className="rounded-xl"
//               src={SolarPanelHouse}
//               alt="Maison avec des panneaux solaires sur le toit"
//               objectFit="cover"
//             />
//           </div>
//           <p className="text-center mt-5 text-lg sm:text-xl md:text-2xl">
//             Bénéficiez de l&apos;offre de revente de votre surplus de production photovoltaïque
//           </p>
//           <p className="text-center mt-5 text-lg sm:text-xl md:text-2xl">
//             Nous nous engageons pour la démocratisation de la production d&apos;énergie et nous vous rachètons votre surplus !
//           </p>
//           <div className="flex justify-between h-full w-full mt-10">
//             <div className="text-center text-sm sm:text-base md:text-lg lg:text-xl w-2/3 flex flex-col justify-evenly">
//               <p>Que vous ayez un contrat d&apos;électricité chez NOUS ou non, nous vous rachetons votre excédent de production solaire.</p>
//               <p className="text-xl sm:text-2xl md:text-3xl text-center">
//                 Prix de rachat du kWh jusqu&apos;à 7ct d&apos;€
//               </p>
//             </div>
//             <div className="w-1/3">
//               <Image
//                 className="rounded-xl"
//                 src={SolarPanel}
//                 alt="Maison avec des panneaux solaires sur le toit"
//                 objectFit="cover"
//               />
//             </div>
//           </div>
//         </div>
//         <h2 className="uppercase text-center w-full text-sm sm:text-base md:text-lg lg:text-4xl font-bold text-lime-600">placer votre surplus de production</h2>
//         <div className="text-sm sm:text-base md:text-lg lg:text-4xl">Nous créons des solutions financières innovantes pour concrétiser vos projets, optimiser vos placements et personnaliser vos investissements</div>
//         <div className="flex shadow-2xl shadow-yellow-300 rounded-md">
//           <Image
//             className="w-1/2 rounded-l-lg"
//             src={SolarPanelHouse2}
//             alt="Maison avec des panneaux solaires sur le toit"
//             objectFit="cover"
//           />
//           <div className="w-1/2">
//             <div className="mx-20">
//               <p className="text-xl mt-4">Nous estimons que chaque personne mérite de créer son avenir. </p>
//               <p className="font-bold text-center text-xl mt-4">acheter une nouvelle voiture, un futur voyage,ou un placement pour la retraite </p>
//               <Link className="hover:bg-black hover:text-white flex border-2 uppercase rounded-sm border-black mt-5 justify-center  text-center" href="/dashboard">nos placements</Link>

//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }
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