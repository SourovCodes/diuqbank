import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/generated/export.dart';
import 'questions_providers.dart';

class QuestionsScreen extends ConsumerWidget {
  const QuestionsScreen({super.key});

  Future<void> _refresh(WidgetRef ref) {
    ref.invalidate(questionsPageProvider);
    return ref.read(questionsPageProvider(1).future);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final firstPage = ref.watch(questionsPageProvider(1));

    return Scaffold(
      appBar: AppBar(title: const Text('QuestionBank')),
      body: switch (firstPage) {
        AsyncData(:final value) when value.total == 0 => const _Message(
          icon: Icons.inbox_outlined,
          text: 'No question papers yet.',
        ),
        AsyncData(:final value) => RefreshIndicator(
          onRefresh: () => _refresh(ref),
          child: ListView.separated(
            itemCount: value.total,
            separatorBuilder: (_, _) => const Divider(height: 1),
            itemBuilder: (context, index) => _QuestionItem(index: index),
          ),
        ),
        AsyncError() => _Message(
          icon: Icons.cloud_off_outlined,
          text: "Couldn't load questions.",
          onRetry: () => ref.invalidate(questionsPageProvider),
        ),
        _ => const Center(child: CircularProgressIndicator()),
      },
    );
  }
}

/// Row [index] of the whole list, read from the page it falls on.
class _QuestionItem extends ConsumerWidget {
  const _QuestionItem({required this.index});

  final int index;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final page = index ~/ questionsPageSize + 1;
    final offset = index % questionsPageSize;

    return switch (ref.watch(questionsPageProvider(page))) {
      AsyncData(:final value) when offset < value.items.length => QuestionTile(
        question: value.items[offset],
      ),
      AsyncData() => const SizedBox.shrink(),
      // One retry button per failed page, on its first row.
      AsyncError() when offset == 0 => ListTile(
        title: const Text("Couldn't load more questions."),
        trailing: TextButton(
          onPressed: () => ref.invalidate(questionsPageProvider(page)),
          child: const Text('Retry'),
        ),
      ),
      AsyncError() => const SizedBox.shrink(),
      _ => const ListTile(title: Text('…')),
    };
  }
}

class QuestionTile extends StatelessWidget {
  const QuestionTile({super.key, required this.question});

  final Question question;

  @override
  Widget build(BuildContext context) {
    final papers = question.submissionCounts.published;
    return ListTile(
      title: Text(question.course.name),
      subtitle: Text(
        '${question.department.shortName} · ${question.examType.name} · '
        '${question.semester.name}',
      ),
      trailing: Text(papers == 1 ? '1 paper' : '$papers papers'),
    );
  }
}

class _Message extends StatelessWidget {
  const _Message({required this.icon, required this.text, this.onRetry});

  final IconData icon;
  final String text;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        spacing: 12,
        children: [
          Icon(icon, size: 48, color: Theme.of(context).colorScheme.outline),
          Text(text),
          if (onRetry != null)
            FilledButton(onPressed: onRetry, child: const Text('Retry')),
        ],
      ),
    );
  }
}
