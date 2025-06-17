const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";

module.exports = {
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: `${API_BASE_URL}/auth/:path*`,
      },
    ];
  },
};
