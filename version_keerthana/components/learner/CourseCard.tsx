export default function CourseCard({ course }: any) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-slate-800">
            {course.title}
          </h3>
          <p className="text-sm text-slate-500">
            {course.skill} • {course.instructor}
          </p>
        </div>
  
        <div className="mb-3">
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-teal-600 h-2 rounded-full"
              style={{ width: `${course.progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {course.lessonsCompleted}/{course.totalLessons} lessons completed
          </p>
        </div>
  
        <span
          className={`text-xs font-medium w-fit px-2 py-1 rounded-full mb-4
            ${
              course.status === "Completed"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
        >
          {course.status}
        </span>
  
        <div className="mt-auto flex gap-2">
          <button className="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700">
            Continue
          </button>
          <button className="flex-1 border border-slate-300 py-2 rounded-lg text-slate-700">
            View Details
          </button>
        </div>
      </div>
    );
  }
  