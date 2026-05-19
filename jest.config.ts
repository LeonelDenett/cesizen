import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>", "<rootDir>/__tests__"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  moduleDirectories: ["node_modules", "lib", "components", "app"],
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/__tests__/setup.ts", "<rootDir>/__tests__/e2e/"],
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
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
