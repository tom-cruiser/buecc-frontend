const config = {
  API_BASE_URL: (import.meta.env.VITE_API_URL || 'https://buecc-backend.onrender.com').replace(/\/$/, ''),
  get API_ENDPOINT() {
    return `${this.API_BASE_URL}/api`;
  },
  getImageUrl: (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    // Remove any leading slashes from the path
    const cleanPath = path.replace(/^\/+/, '');
    return `${config.API_BASE_URL}/${cleanPath}`;
  }
};

export default config;