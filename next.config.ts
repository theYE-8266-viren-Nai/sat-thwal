import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/academic-support",
        destination: "/tutors",
        permanent: false,
      },
      {
        source: "/academic",
        destination: "/tutors",
        permanent: false,
      },
      {
        source: "/student-housing",
        destination: "/hostels",
        permanent: false,
      },
      {
        source: "/housing",
        destination: "/hostels",
        permanent: false,
      },
      {
        source: "/meal-support",
        destination: "/food",
        permanent: false,
      },
      {
        source: "/meals",
        destination: "/food",
        permanent: false,
      },
      {
        source: "/campus-transport",
        destination: "/transportation",
        permanent: false,
      },
      {
        source: "/transport",
        destination: "/transportation",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
