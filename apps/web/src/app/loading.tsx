export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-4" />
      <div className="h-4 bg-gray-100 rounded w-1/2 mb-8" />
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-1/4" />
        <div className="h-24 bg-gray-100 rounded-xl" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-2/3" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-1/5" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
