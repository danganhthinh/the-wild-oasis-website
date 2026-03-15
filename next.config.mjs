/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const remotePatterns = [
  {
    protocol: "https",
    hostname: "mcncmjhcbalkwbvgamya.supabase.co",
    port: "",
    pathname: "/storage/v1/object/public/cabin-images/**",
  },
  {
    protocol: "https",
    hostname: "dclaevbcqixfuwqumflj.supabase.co",
    port: "",
    pathname: "/storage/v1/object/public/cabin-images/**",
  },
  {
    protocol: "https",
    hostname: "res.cloudinary.com",
    port: "",
    pathname: "/**",
  },
];

if (apiUrl) {
  try {
    const url = new URL(apiUrl);
    remotePatterns.push({
      protocol: url.protocol.replace(":", ""),
      hostname: url.hostname,
      port: url.port,
      pathname: "/uploads/**",
    });
  } catch (e) {
    console.error("Invalid NEXT_PUBLIC_API_URL in next.config.mjs", e);
  }
}

const nextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
