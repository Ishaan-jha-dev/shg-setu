import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/setu-shg.apk",
        headers: [
          {
            key: "Content-Disposition",
            value: 'attachment; filename="setu-shg.apk"',
          },
          {
            key: "Content-Type",
            value: "application/vnd.android.package-archive",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
