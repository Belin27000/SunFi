import type { Config } from 'jest';
import jestTransform from './jest.transform.js'; // Import de votre fichier transformateur

const config: Config = {
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': [
            'esbuild-jest',
            {
                loaders: {
                    '.js': 'jsx', // Indiquer que `.js` doit être traité comme du JSX
                    '.ts': 'tsx', // Indiquer que `.ts` doit être traité comme du TSX
                },
            },
        ],
        // Utiliser un transformateur personnalisé pour d'autres fichiers
        '^.+\\.custom$': jestTransform, // Fichier custom
    },
    transformIgnorePatterns: [
        'node_modules/(?!(wagmi|viem|@wagmi|@ethersproject)/)', // Inclure wagmi et viem
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    collectCoverageFrom: [
        '**/*.{ts,tsx,js,jsx}',
        '!**/node_modules/**',
        '!**/.next/**',
        '!**/*.d.ts',
    ],
};

export default config;