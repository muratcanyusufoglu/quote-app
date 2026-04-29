const { withXcodeProject } = require("@expo/config-plugins");

// Fixes Xcode 15+ false-positive "Cycle inside" build errors.
// Sets USER_SCRIPT_SANDBOXING = NO in all build configurations and marks
// all existing PBXShellScriptBuildPhase entries as alwaysOutOfDate = 1.
// This runs during `expo prebuild` and modifies only the .xcodeproj — never the Podfile.
module.exports = function withFixXcodeBuildCycle(config) {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;

    // 1. Disable script sandboxing on all build configurations
    //    so Xcode stops analysing input/output dependencies for script phases.
    const buildConfigs = project.pbxXCBuildConfigurationSection();
    Object.values(buildConfigs).forEach((bc) => {
      if (bc && typeof bc === "object" && bc.buildSettings) {
        bc.buildSettings["USER_SCRIPT_SANDBOXING"] = "NO";
        bc.buildSettings["ENABLE_USER_SCRIPT_SANDBOXING"] = "NO";
      }
    });

    // 2. Mark every existing shell script phase as alwaysOutOfDate = 1
    //    so Xcode skips dependency analysis for them entirely.
    const scriptPhases =
      project.hash.project.objects["PBXShellScriptBuildPhase"] || {};
    Object.values(scriptPhases).forEach((phase) => {
      if (phase && typeof phase === "object" && phase.isa === undefined) return;
      if (phase && typeof phase === "object") {
        phase.alwaysOutOfDate = 1;
      }
    });

    return config;
  });
};
