export const CONFIG_TEMPLATE = `import { defineConfig } from "@gmoonc/core";

export const gmooncConfig = defineConfig({
  appName: "Dashboard",
  menu: [
    { id: "home", label: "Home", path: "/" },
    { id: "dashboard", label: "Dashboard", path: "/dashboard" },
    { id: "admin", label: "Admin", path: "/admin", roles: ["admin"] }
  ]
});
`;

export const ADMIN_SHELL_TEMPLATE = `import React from "react";
import { GmooncShell } from "@gmoonc/ui";
import { gmooncConfig } from "./config";

export function AdminShell(props: { children?: React.ReactNode }) {
  const [activePath, setActivePath] = React.useState("/");

  return (
    <GmooncShell
      config={gmooncConfig}
      roles={["admin"]}
      activePath={activePath}
      onNavigate={(path) => setActivePath(path)}
    >
      {props.children ?? (
        <div style={{ padding: 16 }}>
          <h2>Goalmoon Ctrl (gmoonc)</h2>
          <p>Shell instalado com sucesso.</p>
          <p>activePath: {activePath}</p>
        </div>
      )}
    </GmooncShell>
  );
}
`;
