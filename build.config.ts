import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
    clean: true,
    declaration: true,
    externals: ["rollup", "vite"],
    failOnWarn: false,
    rollup: {
        emitCJS: true,
    },
});
