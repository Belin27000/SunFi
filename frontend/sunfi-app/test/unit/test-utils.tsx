import React from 'react';
import { WagmiConfig, createClient, configureChains } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { MockConnector } from 'wagmi/connectors/mock';
import { render } from '@testing-library/react';

// Configurer les chaînes et le client Wagmi
const { provider } = configureChains([], [publicProvider()]);
const wagmiClient = createClient({
    autoConnect: true,
    provider,
    connectors: [
        new MockConnector({
            options: {
                signer: {
                    getAddress: async () => '0xMockAddress',
                },
            },
        }),
    ],
});

// Crée un wrapper pour inclure WagmiConfig dans vos tests
const Providers = ({ children }: { children: React.ReactNode }) => (
    <WagmiConfig client={wagmiClient}>{children}</WagmiConfig>
);

// Remplace la méthode de rendu de React Testing Library
const customRender = (ui: React.ReactElement, options = {}) =>
    render(ui, { wrapper: Providers, ...options });

// Réexporter tout depuis React Testing Library
export * from '@testing-library/react';
export { customRender as render };