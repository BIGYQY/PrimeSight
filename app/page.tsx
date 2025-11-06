export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        {/* 标题 */}
        <h1 className="text-8xl font-bold text-gray-900 mb-4">
          PrimeSight
        </h1>

        {/* 副标题 */}
        <p className="text-3xl text-gray-600 mb-2">
          顶级视野
        </p>

        {/* 标语 */}
        <p className="text-lg text-gray-500 mb-8">
          洞查一切，追求卓越！————BIGYQY
        </p>

        {/* 占位按钮（以后会变成真的功能） */}
        <div className="flex gap-4 justify-center">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            开始使用
          </button>
          <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
            了解更多
          </button>
        </div>
      </div>
    </main>
  );
}
