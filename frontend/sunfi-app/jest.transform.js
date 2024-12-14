import { createTransformer } from 'esbuild-jest';

export default createTransformer({
    loaders: {
        '.js': 'jsx', // Traiter les fichiers .js comme JSX
        '.ts': 'tsx', // Traiter les fichiers .ts comme TSX
    },
});