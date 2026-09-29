import 'package:go_router/go_router.dart';

import 'features/questions/questions_screen.dart';

final router = GoRouter(
  routes: [
    GoRoute(path: '/', builder: (context, state) => const QuestionsScreen()),
  ],
);
