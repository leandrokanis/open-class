"use client";

import { useContext } from "react";
import { PlatformConfigContext } from "./PlatformConfigProvider";
import { DEFAULT_PLATFORM_CONFIG, type PlatformConfig } from "@/lib/platform-config";

/** Reads the platform config from context, falling back to defaults. */
export function usePlatformConfig(): PlatformConfig {
  return useContext(PlatformConfigContext) ?? DEFAULT_PLATFORM_CONFIG;
}
