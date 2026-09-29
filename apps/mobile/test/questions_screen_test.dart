import 'package:diuqbank/api/generated/export.dart';
import 'package:diuqbank/features/questions/questions_providers.dart';
import 'package:diuqbank/features/questions/questions_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

Question _question(int id, String course, {int published = 1}) => Question(
  id: id,
  department: const Department(
    id: 1,
    name: 'Computer Science',
    shortName: 'CSE',
  ),
  course: QuestionCourse(id: id, name: course),
  semester: const Semester(id: 1, name: 'Fall 25'),
  examType: const ExamType(id: 1, name: 'Final'),
  submissionCounts: SubmissionCounts(
    published: published,
    pendingReview: 0,
    rejected: 0,
  ),
  viewCount: 0,
);

Widget _app(Future<QuestionList> Function(int page) load) => ProviderScope(
  overrides: [questionsPageProvider.overrideWith((ref, page) => load(page))],
  child: const MaterialApp(home: QuestionsScreen()),
);

void main() {
  testWidgets('lists questions from the API', (tester) async {
    await tester.pumpWidget(
      _app(
        (page) async => QuestionList(
          items: [
            _question(1, 'Data Structures', published: 2),
            _question(2, 'Physics I'),
          ],
          page: page,
          pageSize: questionsPageSize,
          total: 2,
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Data Structures'), findsOneWidget);
    expect(find.text('2 papers'), findsOneWidget);
    expect(find.text('Physics I'), findsOneWidget);
    expect(find.text('CSE · Final · Fall 25'), findsNWidgets(2));
  });

  testWidgets('shows an empty state', (tester) async {
    await tester.pumpWidget(
      _app(
        (page) async => const QuestionList(
          items: [],
          page: 1,
          pageSize: questionsPageSize,
          total: 0,
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('No question papers yet.'), findsOneWidget);
  });

  testWidgets('offers a retry when loading fails', (tester) async {
    await tester.pumpWidget(_app((page) => Future.error(Exception('offline'))));
    await tester.pumpAndSettle();

    expect(find.text("Couldn't load questions."), findsOneWidget);
    expect(find.text('Retry'), findsOneWidget);
  });
}
