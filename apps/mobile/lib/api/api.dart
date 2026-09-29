import 'package:cookie_jar/cookie_jar.dart';
import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'generated/qb_api.dart';

/// The site the app talks to. Point it at a local dev server with
/// `--dart-define=API_BASE_URL=http://10.0.2.2:5173` (Android emulator) or
/// `http://localhost:5173` (iOS simulator).
const apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'https://diuqbank.com',
);

/// Cookies the API sets, like a browser keeps them. The view cookies make each
/// install count a page view at most once a day. `main` swaps in one that's saved
/// on the device; this in-memory one is for tests.
final cookieJarProvider = Provider<CookieJar>((ref) => CookieJar());

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: apiBaseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 20),
    ),
  )..interceptors.add(CookieManager(ref.watch(cookieJarProvider)));
  ref.onDispose(dio.close);
  return dio;
});

final qbApiProvider = Provider<QbApi>((ref) => QbApi(ref.watch(dioProvider)));
