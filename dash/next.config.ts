module.exports = {
  async rewrites() {
    return [
      {
        source: '/auth/:path*',
        destination: 'http://localhost:8000/auth/:path*',
      },
    ];
  },
};
