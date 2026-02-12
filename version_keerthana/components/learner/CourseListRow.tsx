export default function CourseListRow({ course }: any) {
    return (
      <tr className="border-b">
        <td className="py-3 text-slate-800">{course.title}</td>
        <td className="text-slate-600">{course.progress}%</td>
        <td className="text-slate-600">{course.lastAccessed}</td>
        <td className="text-slate-600">{course.nextTask}</td>
        <td>
          <button className="text-teal-600 font-medium">Continue</button>
        </td>
      </tr>
    );
  }
  