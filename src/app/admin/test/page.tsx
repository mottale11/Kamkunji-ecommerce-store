export default function AdminTestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Test Page</h1>
        <p className="text-gray-600 mb-6">This page confirms the admin route is working</p>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ✅ Admin route is accessible!
        </div>
        <div className="mt-4 text-sm text-gray-500">
          <p>Path: /admin/test</p>
          <p>Time: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
