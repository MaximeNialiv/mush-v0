/** @type {import('next').NextConfig} */

// This file sets up the configuration for Next.js
// including the Sentry integration

const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['vmrtygakzgwammtcoqts.supabase.co'],
  },
  // Ajoutez d'autres configurations Next.js ici si nécessaire
};

// Configuration Sentry
const sentryWebpackPluginOptions = {
  // Options supplémentaires pour le plugin webpack Sentry
  silent: true, // Supprime les messages du plugin webpack Sentry
};

// Exporter la configuration avec Sentry
module.exports = withSentryConfig(
  nextConfig,
  sentryWebpackPluginOptions
);
