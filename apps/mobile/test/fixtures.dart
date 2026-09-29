// Test data shaped like the API's responses.
import 'package:diuqbank/api/generated/export.dart';

Uploader uploader(String name) =>
    Uploader(id: name, username: name, name: name, image: null);

Submission submission(
  int id, {
  SubmissionStatus status = SubmissionStatus.published,
  String? section,
  String? batch,
  Uploader? uploader,
}) => Submission(
  id: id,
  status: status,
  fileSize: 1000,
  createdAt: DateTime.utc(2026),
  likeCount: 0,
  dislikeCount: 0,
  viewCount: 0,
  section: section,
  batch: batch,
  uploader: uploader,
  fileUrl: status == SubmissionStatus.published
      ? 'https://files.example/$id.pdf'
      : null,
);

QuestionDetail questionDetail(
  List<Submission> submissions, {
  int pendingReview = 0,
}) => QuestionDetail(
  id: 7,
  department: const Department(
    id: 1,
    name: 'Computer Science',
    shortName: 'CSE',
  ),
  course: const QuestionCourse(id: 3, name: 'Data Structures'),
  semester: const Semester(id: 1, name: 'Fall 25'),
  examType: const ExamType(id: 1, name: 'Final'),
  submissionCounts: SubmissionCounts(
    published: submissions
        .where((s) => s.status == SubmissionStatus.published)
        .length,
    pendingReview: pendingReview,
    rejected: 0,
  ),
  viewCount: 0,
  submissions: submissions,
  viewToken: 'token-7',
);

const cse = DepartmentListItem(
  id: 5,
  name: 'Computer Science and Engineering',
  shortName: 'CSE',
  publishedCount: 1220,
);
const swe = DepartmentListItem(
  id: 13,
  name: 'Software Engineering',
  shortName: 'SWE',
  publishedCount: 646,
);

const taxonomy = Taxonomy(
  departments: [swe, cse],
  courses: [
    Course(id: 198, name: 'Mathematics I', departmentId: 5),
    Course(id: 199, name: 'Mathematics II', departmentId: 5),
    Course(id: 200, name: 'Data Structures', departmentId: 5),
    Course(id: 300, name: 'Structured Programming', departmentId: 13),
  ],
  semesters: [Semester(id: 1, name: 'Fall 25')],
  examTypes: [ExamType(id: 1, name: 'Final')],
);

Question question(
  int id, {
  String course = 'Mathematics I',
  int courseId = 198,
  String exam = 'Final',
  String semester = 'Fall 25',
  int papers = 1,
  int views = 0,
}) => Question(
  id: id,
  department: const Department(
    id: 5,
    name: 'Computer Science and Engineering',
    shortName: 'CSE',
  ),
  course: QuestionCourse(id: courseId, name: course),
  semester: Semester(id: id, name: semester),
  examType: ExamType(id: exam.length, name: exam),
  submissionCounts: SubmissionCounts(
    published: papers,
    pendingReview: 0,
    rejected: 0,
  ),
  viewCount: views,
);

QuestionList page(List<Question> items) =>
    QuestionList(items: items, page: 1, pageSize: 20, total: items.length);
