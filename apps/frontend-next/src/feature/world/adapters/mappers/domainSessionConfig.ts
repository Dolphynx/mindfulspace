import type { Domain } from "@/feature/world/hub/types";

export const domainSessionConfig: Record<Domain, { createEndpoint: string }> = {
    sleep: { createEndpoint: "/sleep" },
    meditation: { createEndpoint: "/me/meditation-sessions" },
    exercise: { createEndpoint: "/exercices" },
};
