import type { NextConfig } from "next";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

let backendHost = "127.0.0.1";
let backendProtocol: "http" | "https" = "http";
let backendPort = "8000";

try {
  const url = new URL(BACKEND_URL);
  backendHost = url.hostname;
  backendProtocol = url.protocol.replace(":", "") as "http" | "https";
  backendPort = url.port;
} catch (e) {
  // fallback
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: backendProtocol,
        hostname: backendHost,
        ...(backendPort ? { port: backendPort } : {}),
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
