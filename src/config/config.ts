const config = {
  API_BASE_URL: import.meta.env.VITE_API_URL || 'https://buecc-backend.onrender.com',
  API_ENDPOINT: `${import.meta.env.VITE_API_URL || 'https://buecc-backend.onrender.com'}/api`,
  getImageUrl: (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${config.API_BASE_URL}${path}`;
  }
};

export default config;