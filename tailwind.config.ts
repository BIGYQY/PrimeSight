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
    },
  },
  plugins: [],
};

export default config;
