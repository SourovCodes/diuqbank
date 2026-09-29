# QuestionBank mobile app

Flutter app for Android (`com.bongomaker.diuqbank`) and iOS (`com.diuqbank.app`), using Riverpod and go_router. See "Mobile app" in the repository's README for how it fits in with the API.

```bash
fvm install             # the Flutter version pinned in .fvmrc
flutter pub get
flutter run             # against https://diuqbank.com
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5173   # local dev server, Android emulator
```

- `lib/api/generated/` – the API client, generated from `../api/openapi.json`. Don't edit it; run `tool/generate_api.sh` after `pnpm openapi`.
- `lib/api/api.dart` – Dio and client providers, base URL.
- `lib/features/` – screens and their providers, one folder per feature.
- `lib/router.dart` – routes (go_router).

Checks (also run by the mobile jobs in `.github/workflows/ci.yml`): `dart format lib test`, `flutter analyze`, `flutter test`.
