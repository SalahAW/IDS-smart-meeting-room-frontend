"use client";

import { useSession } from "next-auth/react";

export function SessionDebugger() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return <p>Loading session...</p>;
    }

    console.log("Current Session:", session);

    return (
        <pre
            style={{
                background: "#222",
                color: "#fff",
                padding: "1rem",
                borderRadius: "8px",
                marginTop: "1rem",
            }}
        >
      {JSON.stringify(session, null, 2)}
    </pre>
    );
}