-- Sample data for local development only. Re-running replaces all question data.
-- Applied by `pnpm db:seed` (seeds/seed-local.mjs), which also uploads the PDFs to local R2.

DELETE FROM submissions;
DELETE FROM questions;
DELETE FROM courses;
DELETE FROM departments;
DELETE FROM semesters;
DELETE FROM exam_types;

INSERT INTO departments (id, name, short_name) VALUES
  (1, 'Computer Science and Engineering', 'CSE'),
  (2, 'Electrical and Electronic Engineering', 'EEE'),
  (3, 'Business Administration', 'BBA');

INSERT INTO courses (id, name, department_id) VALUES
  (1, 'Data Structures', 1),
  (2, 'Algorithms', 1),
  (3, 'Database Systems', 1),
  (4, 'Discrete Mathematics', 1),
  (5, 'Circuit Analysis', 2),
  (6, 'Digital Electronics', 2),
  (7, 'Principles of Accounting', 3),
  (8, 'Marketing Management', 3),
  -- Same course name in two departments, to show the department suffix.
  (9, 'Discrete Mathematics', 2);

INSERT INTO semesters (id, name) VALUES
  (1, '1st Semester'), (2, '2nd Semester'), (3, '3rd Semester'), (4, '4th Semester'),
  (5, '5th Semester'), (6, '6th Semester'), (7, '7th Semester'), (8, '8th Semester');

INSERT INTO exam_types (id, name) VALUES
  (1, 'Midterm'),
  (2, 'Final'),
  (3, 'Class Test');

INSERT INTO questions (id, department_id, course_id, semester_id, exam_type_id) VALUES
  (1, 1, 1, 2, 1),
  (2, 1, 1, 2, 2),
  (3, 1, 2, 3, 2),
  (4, 1, 3, 5, 1),
  (5, 1, 4, 1, 3),
  (6, 2, 5, 1, 2),
  (7, 2, 6, 3, 1),
  (8, 3, 7, 1, 2),
  (9, 3, 8, 4, 1),
  (10, 2, 9, 2, 2);

-- file_size is set by the seed script from the uploaded sample PDF.
INSERT INTO submissions (id, question_id, status, file_key, file_size) VALUES
  ('seed-01', 1, 'published', 'submissions/seed-01.pdf', 0),
  ('seed-02', 1, 'published', 'submissions/seed-02.pdf', 0),
  ('seed-03', 2, 'published', 'submissions/seed-03.pdf', 0),
  ('seed-04', 3, 'published', 'submissions/seed-04.pdf', 0),
  ('seed-05', 4, 'published', 'submissions/seed-05.pdf', 0),
  ('seed-06', 5, 'published', 'submissions/seed-06.pdf', 0),
  ('seed-07', 6, 'published', 'submissions/seed-07.pdf', 0),
  ('seed-08', 7, 'published', 'submissions/seed-08.pdf', 0),
  ('seed-09', 8, 'published', 'submissions/seed-09.pdf', 0),
  ('seed-10', 9, 'pending_review', 'submissions/seed-10.pdf', 0),
  ('seed-11', 10, 'published', 'submissions/seed-11.pdf', 0),
  ('seed-12', 3, 'rejected', 'submissions/seed-12.pdf', 0);
