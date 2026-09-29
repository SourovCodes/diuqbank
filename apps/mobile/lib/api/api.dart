import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'generated/qb_api.dart';

/// The site the app talks to. Point it at a local dev server with
/// `--dart-define=API_BASE_URL=http://10.0.2.2:5173` (Android emulator) or
/// `http://localhost:5173` (iOS simulator).
const apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'https://diuqbank.com',
);

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: apiBaseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 20),
    ),
  );
  ref.onDispose(dio.close);
  return dio;
});

final qbApiProvider = Provider<QbApi>((ref) => QbApi(ref.watch(dioProvider)));
