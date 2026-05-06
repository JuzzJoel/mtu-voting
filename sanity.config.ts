import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { schemaTypes } from "./src/sanity/schemaTypes";

export default defineConfig({
  name: "mtu-voting",
  title: "MTU Voting CMS",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  basePath: "/studio",
  plugins: [deskTool()],
  schema: {
    types: schemaTypes
  }
});
