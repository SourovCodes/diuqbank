import 'package:diuqbank/api/generated/export.dart';
import 'package:diuqbank/data/prefs.dart';
import 'package:diuqbank/data/questions.dart';
import 'package:diuqbank/data/taxonomy.dart';
import 'package:diuqbank/features/questions/question_providers.dart';
import 'package:diuqbank/main.dart';
import 'package:diuqbank/router.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'fixtures.dart';

class FakeViewCounter implements ViewCounter {
  final views = <String>[];

  @override
  Future<void> question(int id, String viewToken) async =>
      views.add('question $id');

  @override
  Future<void> paper(int submissionId, String viewToken) async =>
      views.add('paper $submissionId');
}

/// Question lists by query: a course's exams, the most viewed, or the newest.
typedef Lists = Future<QuestionList> Function(QuestionQuery query);

/// The whole app on a phone-sized screen, with the API replaced by test data.
Future<FakeViewCounter> pumpApp(
  WidgetTester tester, {
  Lists? lists,
  Future<QuestionDetail> Function(int id)? questions,
}) async {
  tester.view
    ..physicalSize = const Size(1080, 2340)
    ..devicePixelRatio = 2.625;
  addTearDown(tester.view.reset);
  SharedPreferences.setMockInitialValues({});
  final prefs = await SharedPreferences.getInstance();
  final counter = FakeViewCounter();

  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        prefsProvider.overrideWithValue(prefs),
        taxonomyProvider.overrideWith((ref) async => taxonomy),
        questionPageProvider.overrideWith(
          (ref, key) => (lists ?? defaultLists)(key.$1),
        ),
        questionProvider.overrideWith(
          (ref, id) =>
              (questions ?? (id) async => questionDetail([submission(1)]))(id),
        ),
        viewCounterProvider.overrideWithValue(counter),
        paperViewerProvider.overrideWithValue(
          (url, events) => GestureDetector(
            onTap: events.onTap,
            child: Center(child: Text('PDF $url')),
          ),
        ),
      ],
      child: QbApp(router: buildRouter()),
    ),
  );
  await tester.pumpAndSettle();
  return counter;
}

Future<QuestionList> defaultLists(QuestionQuery query) async => page(
  query.courseId != null
      ? [
          question(1, exam: 'Final', semester: 'Fall 24'),
          question(2, exam: 'Midterm', semester: 'Fall 25'),
          question(3, exam: 'Quiz', semester: 'Spring 26'),
          question(4, exam: 'Final', semester: 'Spring 25'),
        ]
      : query.sort == QuestionSort.popular
      ? [question(10, views: 6358), question(11, views: 5400)]
      : [
          question(20, course: 'Data Structures', courseId: 200, exam: 'Quiz'),
          question(21, course: 'Structured Programming', courseId: 300),
        ],
);

/// Scrolls the list that holds [finder] until it is fully visible.
Future<void> scrollTo(WidgetTester tester, Finder finder) async {
  final list = find
      .ancestor(of: finder, matching: find.byType(Scrollable))
      .first;
  await tester.scrollUntilVisible(finder, 200, scrollable: list);
  await tester.pumpAndSettle();
}
