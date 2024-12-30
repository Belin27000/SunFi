// utils/contractUtils.js

export const checkClient = async (addr, publicClient, contractAddress, contractAbi) => {
    try {
        const result = await publicClient.readContract({
            address: contractAddress,
            abi: contractAbi,
            functionName: 'getClient',
            args: [addr],
        });
        return { isClient: result, error: null };
    } catch (error) {
        return { isClient: false, error: error.message || 'Erreur inconnue' };
    }
};

export const addClientToContract = async (addr, writeContract, publicClient) => {
    try {
        const result = await writeContract({
            args: [addr],
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash: result.hash });
        return receipt.status === 1 ? 'success' : 'error';
    } catch (error) {
        console.error('Error adding client:', error);
        return 'error';
    }
};

export const deleteClientFromContract = async (addr, writeContract, publicClient) => {
    try {
        const result = await writeContract({
            args: [addr],
        });

        // Attendre la confirmation de la transaction
        const receipt = await publicClient.waitForTransactionReceipt({ hash: result.hash });

        return receipt.status === 1 ? 'success' : 'error'; // Vérifier si la transaction a réussi
    } catch (error) {
        console.error('Error deleting client:', error);
        return 'error';
    }
};