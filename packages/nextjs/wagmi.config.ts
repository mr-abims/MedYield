import { defineConfig } from "@wagmi/cli";
import { foundry, react } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "src/generated.ts",
  plugins: [
    foundry({
      project: "../foundry",
      include: [
        "MedYieldHub.sol/**",
        "DataVault.sol/**",
        "TemplateRegistry.sol/**",
        "VaultDeployer.sol/**",
        "MedYieldConditionResolver.sol/**",
        "templates/**",
        "interfaces/**",
      ],
    }),
    react(),
  ],
});
