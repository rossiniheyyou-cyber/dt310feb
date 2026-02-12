export default function CompletedCourses() {
    return (
      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          ✅ Completed Courses
        </h2>
  
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h4 className="font-medium text-slate-800">React Fundamentals</h4>
            <p className="text-sm text-slate-500">Certificate Earned</p>
            <button className="mt-3 text-teal-600 font-medium">
              Download Certificate
            </button>
          </div>
        </div>
      </div>
    );
  }
  