import 'dart:convert';
import 'dart:typed_data';

import 'package:diuqbank/api/api.dart';
import 'package:diuqbank/api/generated/export.dart';
import 'package:diuqbank/auth/session.dart';
import 'package:diuqbank/auth/token.dart';
import 'package:diuqbank/data/prefs.dart';
import 'package:diuqbank/data/questions.dart';
import 'package:diuqbank/data/taxonomy.dart';
import 'package:diuqbank/features/questions/question_providers.dart';
import 'package:diuqbank/main.dart';
import 'package:diuqbank/router.dart';
import 'package:dio/dio.dart';
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

/// A JSON response from [FakeBackend].
typedef Reply = ({int status, Object? body, Map<String, String> headers});

Reply reply(Object? body, {int status = 200, Map<String, String>? headers}) =>
    (status: status, body: body, headers: headers ?? const {});

/// Answers the app's requests from [routes], keyed like `PUT /api/v1/me`, and
/// keeps them for the test to look at. Anything else is a 404.
class FakeBackend implements HttpClientAdapter {
  FakeBackend([Map<String, Reply Function(RequestOptions)>? routes])
    : routes = {...?routes};

  final Map<String, Reply Function(RequestOptions)> routes;
  final requests = <RequestOptions>[];

  /// The requests sent to `METHOD /path`.
  List<RequestOptions> sent(String route) => [
    for (final r in requests)
      if ('${r.method} ${r.path}' == route) r,
  ];

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    requests.add(options);
    final route = routes['${options.method} ${options.path}'];
    final r = route == null
        ? reply({
            'error': {'code': 'NOT_FOUND', 'message': 'Not found'},
          }, status: 404)
        : route(options);
    return ResponseBody.fromString(
      r.body == null ? '' : jsonEncode(r.body),
      r.status,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
        for (final MapEntry(:key, :value) in r.headers.entries) key: [value],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}

/// Google's account picker, with one account ready (or none: closed).
class FakeGoogleAccounts implements GoogleAccounts {
  FakeGoogleAccounts({this.email = 'nusrat@diu.edu.bd'});

  String? email;
  var forgotten = 0;

  @override
  Future<GoogleIdToken?> pick() async =>
      email == null ? null : (token: 'google-id-token', email: email!);

  @override
  Future<void> forget() async => forgotten++;
}

/// Question lists by query: a course's exams, the most viewed, or the newest.
typedef Lists = Future<QuestionList> Function(QuestionQuery query);

/// The whole app on a phone-sized screen, with the API replaced by test data.
Future<FakeViewCounter> pumpApp(
  WidgetTester tester, {
  Lists? lists,
  Future<QuestionDetail> Function(int id)? questions,
  FakeBackend? backend,
  GoogleAccounts? google,
  TokenStore? tokens,
}) async {
  tester.view
    ..physicalSize = const Size(1080, 2340)
    ..devicePixelRatio = 2.625;
  addTearDown(tester.view.reset);
  SharedPreferences.setMockInitialValues({});
  final prefs = await SharedPreferences.getInstance();
  final counter = FakeViewCounter();
  final store = tokens ?? MemoryTokenStore();
  final token = await store.read();

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
        httpAdapterProvider.overrideWithValue(backend ?? FakeBackend()),
        googleAccountsProvider.overrideWithValue(
          google ?? FakeGoogleAccounts(),
        ),
        tokenStoreProvider.overrideWithValue(store),
        savedSessionTokenProvider.overrideWithValue(token),
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
