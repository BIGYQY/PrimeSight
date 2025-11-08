import type { Config } from "tailwindcss";

const config: Config = {
  // 告诉 Tailwind 去哪些文件里找 class 名
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",     // pages 文件夹
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // components 文件夹
    "./app/**/*.{js,ts,jsx,tsx,mdx}",       // app 文件夹（我们会用这个）
  ],
  theme: {
    extend: {
      // 在这里可以自定义颜色、字体、间距等
      colors: {
        // 示例：自定义主题色（以后可以用 bg-primary）
        primary: "#3B82F6",   // 蓝色
        secondary: "#8B5CF6", // 紫色
      },
      // 自定义动画
      animation: {
        'spin-slow': 'spin 20s linear infinite',      // 慢速旋转（20秒一圈）
        'spin-reverse': 'spin-reverse 15s linear infinite',  // 反向旋转（15秒一圈）
        'spin-fast': 'spin 8s linear infinite',       // 快速旋转（8秒一圈）
        'float': 'float 6s ease-in-out infinite',     // 漂浮动画
        'twinkle': 'twinkle 3s ease-in-out infinite', // 星星闪烁动画
        'drift': 'drift 8s ease-in-out infinite',     // 星星飘动动画
      },
      // 自定义关键帧动画
      keyframes: {
        'spin-reverse': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0) translateX(0)',
            opacity: '0.2'
          },
          '50%': {
            transform: 'translateY(-20px) translateX(10px)',
            opacity: '0.5'
          },
        },
        'twinkle': {
          '0%, 100%': {
            opacity: '0.2',
            filter: 'brightness(1)',
          },
          '50%': {
            opacity: '1',
            filter: 'brightness(1.5)',
          },
        },
        'drift': {
          '0%, 100%': {
            transform: 'translate(0px, 0px)',
          },
          '25%': {
            transform: 'translate(15px, -15px)',
          },
          '50%': {
            transform: 'translate(-10px, 10px)',
          },
          '75%': {
            transform: 'translate(10px, 20px)',
          },
        },
      },
      // 径向渐变背景
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;
