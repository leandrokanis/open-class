import { fetchPlatformConfig } from "@/lib/platform-config";
import { AdminConfigPageClient } from "@/components/admin/AdminConfigPageClient";

export default async function PlatformConfigPage() {
  const config = await fetchPlatformConfig();
  return <AdminConfigPageClient config={config} />;
}
