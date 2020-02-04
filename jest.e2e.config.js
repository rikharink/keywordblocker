module.exports = {
    projects: [
        {
            displayName: 'e2e',
            preset: 'jest-puppeteer',
            testMatch: ['**/?(*.)+(e2e).[t]s'],
            testPathIgnorePatterns: ['/node_modules/', 'dist'],
            setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
            transform: {
                '^.+\\.ts?$': 'ts-jest',
            },
        },
    ],
};
