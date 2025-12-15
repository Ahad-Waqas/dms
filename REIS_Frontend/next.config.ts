import type { NextConfig } from "next";
import CopyWebpackPlugin from "copy-webpack-plugin";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.{glsl,vs,fs,vert,frag}": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
    },
  },
  reactCompiler: true,
  transpilePackages: ['cesium', 'resium'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
         protocol: 'https',
        hostname: 'www.gdacs.org',
        pathname: '**',
      }
    ],
  },
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // Cesium configuration
      config.plugins.push(
        new CopyWebpackPlugin({
          patterns: [
            {
              from: path.join(__dirname, "node_modules/cesium/Build/Cesium/Workers"),
              to: "static/cesium/Workers",
            },
            {
              from: path.join(__dirname, "node_modules/cesium/Build/Cesium/ThirdParty"),
              to: "static/cesium/ThirdParty",
            },
            {
              from: path.join(__dirname, "node_modules/cesium/Build/Cesium/Assets"),
              to: "static/cesium/Assets",
            },
            {
              from: path.join(__dirname, "node_modules/cesium/Build/Cesium/Widgets"),
              to: "static/cesium/Widgets",
            },
          ],
        })
      );

      // Define Cesium build variables
      config.plugins.push(
        new webpack.DefinePlugin({
          CESIUM_BASE_URL: JSON.stringify("/static/cesium/"),
        })
      );

      config.resolve.alias = {
        ...config.resolve.alias,
        cesium: path.resolve(__dirname, "node_modules/cesium/Build/Cesium"),
        "@zip.js/zip.js/lib/zip-no-worker.js": path.resolve(
          __dirname,
          "node_modules/@zip.js/zip.js/lib/zip-core.js"
        ),
        "@zip.js/zip.js/lib/zip-no-worker": path.resolve(
          __dirname,
          "node_modules/@zip.js/zip.js/lib/zip-core.js"
        ),
      };
      
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        http: false,
        https: false,
        stream: false,
        zlib: false,
      };
    }

    config.module = config.module || {};
    config.module.unknownContextCritical = false;
    
    // Handle Cesium's ESM modules
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.m?js$/,
      include: /node_modules[\\/](cesium|resium)/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false
      }
    });

    return config;
  },
};

export default nextConfig;
