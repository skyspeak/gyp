"use client";

import { usePathname } from "next/navigation";

// The site header and footer, minus embeds. An iframe on someone else's page
// showing this site's navigation looks like a hijacked page, and wastes the
// small space the embed has.
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/embed")) return null;
  return <>{children}</>;
}
