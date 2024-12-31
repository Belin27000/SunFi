"use client";

import { useState } from "react";

export default function Timeline() {
    const [hoveredStep, setHoveredStep] = useState<number | null>(null);

    const steps = [
        {
            id: 1,
            title: "Création du Wallet",
            description: "Le client se connecte à la DApp et crée un wallet s'il n'en possède pas.",
            status: "done",
        },
        {
            id: 2,
            title: "Connexion au compteur d'énergie",
            description: "Le client connecte son compteur d'énergie à la DApp pour commencer la simulation de comptage.",
            status: "in-progress"
        },
        {
            id: 3,
            title: "Accès client validé",
            description: "La DApp valide l'accès du client pour activer les fonctionnalités de comptage et de mint de token.",
            status: "done"
        },
        {
            id: 4,
            title: "Contrat de mint de token",
            description: "La DApp génère des tokens en fonction de la production d'énergie enregistrée.",
            status: "done"
        },
        {
            id: 5,
            title: "Staking des tokens",
            description: "Les tokens générés peuvent être stackés pour générer des revenus supplémentaires.",
            status: "not-started"
        },
        {
            id: 6,
            title: "Unstack des tokens",
            description: "Les tokens peuvent être unstake pour être transférés sur le wallet du client.",
            status: "not-started",
        },
        {
            id: 7,
            title: "Paiement",
            description: "Le client peut convertir ses tokens en monnaie fiduciaire ou effectuer un transfert vers un wallet externe.",
            status: "not-started",
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "done":
                return "bg-green-200 text-green-800";
            case "in-progress":
                return "bg-yellow-200 text-yellow-800";
            case "not-started":
                return "bg-gray-200 text-gray-800";
            default:
                return "bg-gray-200 text-gray-800";
        }

    }
    return (
        <div className="flex flex-col items-center bg-gray-50 py-10">
            <h1 className="text-4xl font-bold mb-10 text-gray-800">Roadmap</h1>
            <div className="relative w-full max-w-4xl">
                {/* Ligne verticale */}
                <div className="absolute top-0 left-1/2 w-1 bg-blue-300 h-full transform -translate-x-1/2"></div>

                {steps.map((step, index) => (
                    <div key={step.id} className={`flex ${index % 2 === 0 ? "flex-row-reverse ml-6" : "flex-row pr-12"} relative items-center w-full mb-8 `}
                        onMouseEnter={() => setHoveredStep(step.id)}
                        onMouseLeave={() => setHoveredStep(null)}>
                        {/* Contenu de chaque étape */}
                        <div className="w-1/2 px-6">
                            <div className={`${getStatusColor(step.status)} p-6 rounded-lg shadow-md`}>
                                <h2 className="text-lg font-bold text-blue-800">{step.title}</h2>
                                <p className="text-gray-700 mt-2">{step.description}</p>
                            </div>
                        </div>
                        {hoveredStep === step.id && (
                            <div className="absolute mt-0 top-full w-64 bg-black text-white text-sm p-3 rounded-lg shadow-lg ">
                                <p className={`${getStatusColor(step.status)}`}><strong>Status :</strong> {step.status}</p>
                                <p>{step.title}</p>
                            </div>
                        )}

                        {/* Numéro de l'étape */}
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full text-lg font-bold">
                            {step.id}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}