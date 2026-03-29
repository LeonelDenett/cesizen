import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/__tests__"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/__tests__/setup.ts"],
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
};

export default config;
