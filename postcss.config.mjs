/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},      // 启用 Tailwind CSS
    autoprefixer: {},     // 自动添加浏览器前缀（-webkit-, -moz- 等）
  },
};

export default config;
