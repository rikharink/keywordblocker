module.exports = {
    projects: [
        {
            preset: 'jest-playwright-preset',
            transform: {
                '^.+\\.ts?$': 'ts-jest',
            },
            displayName: 'e2e',
            testMatch: ['**/?(*.)+(e2e).[t]s'],
            testPathIgnorePatterns: ['/node_modules/', 'dist'],
            setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
        },
    ],
};
