import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>", "<rootDir>/__tests__"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  moduleDirectories: ["node_modules", "lib", "components", "app"],
  modulePathIgnorePatterns: ["<rootDir>/.next/"],
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/__tests__/setup.ts", "<rootDir>/__tests__/e2e/"],
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
  collectCoverageFrom: [
    "app/**/*.ts",
    "lib/**/*.ts",
    "components/**/*.ts",
    "!**/*.d.ts",
    "!**/*.test.ts",
    "!**/*.spec.ts",
  ],
  coveragePathIgnorePatterns: ["/node_modules/", "/.next/", "/__tests__/", "/docs/", "/scripts/", "/lib/db/seed.ts", "/lib/db/migrations/", "/lib/db/schema/"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      "tsconfig": {
        "baseUrl": ".",
        "paths": {
          "@/*": ["./*"]
        }
      }
    }]
  }
};

export default config;
