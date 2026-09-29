import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/api.dart';
import '../../api/generated/export.dart';
import '../../data/format.dart';
import '../../data/saved.dart';
import '../../theme/exam_shape.dart';
import '../../widgets/question_row.dart';
import '../../widgets/state_message.dart';
import 'paper_actions.dart';
import 'paper_titles.dart';
import 'question_providers.dart';

/// The reader. The top-ranked published paper fills the screen; a tap on the
/// page hides the bars. A floating toolbar names the paper being read and opens a
/// sheet to switch between the question's papers.
class QuestionScreen extends ConsumerStatefulWidget {
  const QuestionScreen({super.key, required this.id, this.summary});

  final int id;

  /// The row that was tapped, to show the title while the question loads.
  final Question? summary;

  @override
  ConsumerState<QuestionScreen> createState() => _QuestionScreenState();
}

class _QuestionScreenState extends ConsumerState<QuestionScreen> {
  int? _selectedId;
  final _countedPapers = <int>{};
  var _countedQuestion = false;
  var _chrome = true;
  (int, int)? _page;

  @override
  void initState() {
    super.initState();
    ref.listenManual(questionProvider(widget.id), (_, next) {
      if (next case AsyncData(:final value)) _countViews(value);
    }, fireImmediately: true);
  }

  void _countViews(QuestionDetail question) {
    final counter = ref.read(viewCounterProvider);
    if (!_countedQuestion) {
      _countedQuestion = true;
      counter.question(question.id, question.viewToken);
    }
    final paper = _selected(question);
    if (paper != null && _countedPapers.add(paper.id)) {
      counter.paper(paper.id, question.viewToken);
    }
  }

  List<Submission> _published(QuestionDetail question) => [
    for (final s in question.submissions)
      if (s.status == SubmissionStatus.published) s,
  ];

  Submission? _selected(QuestionDetail question) {
    final published = _published(question);
    return published.where((s) => s.id == _selectedId).firstOrNull ??
        published.firstOrNull;
  }

  void _select(QuestionDetail question, int id) {
    setState(() {
      _selectedId = id;
      _page = null;
      _chrome = true;
    });
    _countViews(question);
  }

  @override
  Widget build(BuildContext context) {
    return switch (ref.watch(questionProvider(widget.id))) {
      AsyncData(:final value) => _buildReader(context, value),
      AsyncError(:final error) => Scaffold(
        appBar: _placeholderBar(),
        body: StateMessage(
          icon: isOffline(error)
              ? Icons.cloud_off_rounded
              : Icons.error_outline_rounded,
          shape: ExamKind.midterm,
          title: switch (error) {
            _ when isOffline(error) => "You're offline",
            DioException(response: Response(statusCode: 404)) =>
              'This question no longer exists',
            _ => "Couldn't load this question",
          },
          body: 'Check your connection and try again.',
          actions: [
            FilledButton(
              onPressed: () => ref.invalidate(questionProvider(widget.id)),
              child: const Text('Try again'),
            ),
          ],
        ),
      ),
      _ => Scaffold(
        appBar: _placeholderBar(),
        body: const Center(child: CircularProgressIndicator()),
      ),
    };
  }

  AppBar _placeholderBar() => AppBar(
    title: _Title(
      title: widget.summary?.course.name ?? '',
      details: widget.summary == null ? null : questionDetails(widget.summary!),
    ),
  );

  Widget _buildReader(BuildContext context, QuestionDetail question) {
    final scheme = Theme.of(context).colorScheme;
    final padding = MediaQuery.paddingOf(context);
    final published = _published(question);
    final titles = paperTitles(published);
    final selected = _selected(question);
    final url = selected?.fileUrl == null
        ? null
        : Uri.parse(selected!.fileUrl!);
    final summary = summaryOf(question);
    final saved = ref
        .watch(savedQuestionsProvider)
        .any((q) => q.id == question.id);
    const barHeight = 64.0;
    const motion = Duration(milliseconds: 220);

    return Scaffold(
      backgroundColor: scheme.surfaceContainer,
      body: Stack(
        children: [
          Positioned.fill(
            child: AnimatedPadding(
              duration: motion,
              curve: Curves.easeOutCubic,
              padding: EdgeInsets.only(
                top: padding.top + (_chrome ? barHeight : 0),
              ),
              child: url != null && selected != null
                  ? KeyedSubtree(
                      // Keyed, so switching papers loads the new document.
                      key: ValueKey(selected.id),
                      child: ref.watch(paperViewerProvider)(
                        url,
                        PaperViewEvents(
                          onTap: () => setState(() => _chrome = !_chrome),
                          onPage: (page, count) {
                            if (mounted) setState(() => _page = (page, count));
                          },
                        ),
                      ),
                    )
                  : StateMessage(
                      icon: question.submissionCounts.pendingReview > 0
                          ? Icons.schedule_rounded
                          : Icons.description_outlined,
                      shape: ExamKind.quiz,
                      title: 'No published paper yet',
                      body: question.submissionCounts.pendingReview > 0
                          ? '${plural(question.submissionCounts.pendingReview, 'submission is', 'submissions are')} '
                                'waiting for review. The paper appears here once approved.'
                          : "The papers shared for this exam weren't approved.",
                    ),
            ),
          ),
          // Top bar
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: AnimatedSlide(
              duration: motion,
              curve: Curves.easeOutCubic,
              offset: _chrome ? Offset.zero : const Offset(0, -1),
              child: Material(
                color: scheme.surface,
                child: Padding(
                  padding: EdgeInsets.only(top: padding.top),
                  child: SizedBox(
                    height: barHeight,
                    child: Row(
                      children: [
                        const BackButton(),
                        Expanded(
                          child: _Title(
                            title: question.course.name,
                            details: questionDetails(summary),
                          ),
                        ),
                        IconButton(
                          tooltip: saved ? 'Remove from saved' : 'Save',
                          isSelected: saved,
                          selectedIcon: Icon(
                            Icons.bookmark_rounded,
                            color: scheme.primary,
                          ),
                          icon: const Icon(Icons.bookmark_border_rounded),
                          onPressed: () {
                            ref
                                .read(savedQuestionsProvider.notifier)
                                .toggle(summary);
                            ScaffoldMessenger.of(context)
                              ..hideCurrentSnackBar()
                              ..showSnackBar(
                                SnackBar(
                                  content: Text(
                                    saved ? 'Removed from saved' : 'Saved',
                                  ),
                                ),
                              );
                          },
                        ),
                        const SizedBox(width: 4),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
          // Page counter
          if (_page case (final page, final count) when url != null)
            Positioned(
              top: padding.top + barHeight + 10,
              right: 14,
              child: AnimatedOpacity(
                duration: motion,
                opacity: _chrome ? 1 : 0,
                child: DecoratedBox(
                  decoration: ShapeDecoration(
                    color: scheme.surfaceContainerHighest,
                    shape: const StadiumBorder(),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    child: Text(
                      'Page $page of $count',
                      style: const TextStyle(
                        fontSize: 12,
                        fontFeatures: [FontFeature.tabularFigures()],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          // Floating toolbar
          if (url != null && selected != null)
            Positioned(
              left: 12,
              right: 12,
              bottom: padding.bottom + 14,
              child: AnimatedSlide(
                duration: motion,
                curve: Curves.easeOutCubic,
                offset: _chrome ? Offset.zero : const Offset(0, 1.8),
                child: _Toolbar(
                  paperTitle: titles[selected.id]!,
                  position: published.length > 1
                      ? (published.indexOf(selected) + 1, published.length)
                      : null,
                  onPickPaper: () =>
                      _showPapers(context, question, published, titles),
                  url: url,
                  fileName: paperFileName([
                    question.course.name,
                    question.examType.name,
                    question.semester.name,
                    if (published.length > 1) titles[selected.id]!,
                  ]),
                ),
              ),
            ),
        ],
      ),
    );
  }

  void _showPapers(
    BuildContext context,
    QuestionDetail question,
    List<Submission> published,
    Map<int, String> titles,
  ) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (context) => _PaperSheet(
        papers: published,
        titles: titles,
        selectedId: _selected(question)?.id,
        onPick: (id) {
          Navigator.pop(context);
          _select(question, id);
        },
      ),
    );
  }
}

class _Title extends StatelessWidget {
  const _Title({required this.title, this.details});

  final String title;
  final String? details;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: theme.textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w600,
            fontSize: 17,
          ),
        ),
        if (details != null)
          Text(
            details!,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
      ],
    );
  }
}

class _Toolbar extends StatelessWidget {
  const _Toolbar({
    required this.paperTitle,
    required this.position,
    required this.onPickPaper,
    required this.url,
    required this.fileName,
  });

  final String paperTitle;

  /// (current, count) when the question has more than one paper.
  final (int, int)? position;
  final VoidCallback onPickPaper;
  final Uri url;
  final String fileName;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Material(
      color: scheme.surfaceContainerHighest,
      shape: const StadiumBorder(),
      elevation: 6,
      shadowColor: Colors.black54,
      child: Padding(
        padding: const EdgeInsets.all(6),
        child: Row(
          spacing: 2,
          children: [
            Expanded(
              child: switch (position) {
                (final current, final count) => Material(
                  color: scheme.primary,
                  shape: const StadiumBorder(),
                  clipBehavior: Clip.antiAlias,
                  child: InkWell(
                    onTap: onPickPaper,
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 7, 10, 7),
                      child: Row(
                        spacing: 8,
                        children: [
                          Icon(
                            Icons.description_rounded,
                            color: scheme.onPrimary,
                          ),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  paperTitle,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(
                                    color: scheme.onPrimary,
                                    fontWeight: FontWeight.w600,
                                    fontSize: 14,
                                  ),
                                ),
                                Text(
                                  'Paper $current of $count · change',
                                  style: TextStyle(
                                    color: scheme.onPrimary.withValues(
                                      alpha: 0.85,
                                    ),
                                    fontSize: 11,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Icon(
                            Icons.expand_less_rounded,
                            color: scheme.onPrimary,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                null => Padding(
                  padding: const EdgeInsets.only(left: 14),
                  child: Text(
                    paperTitle,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                ),
              },
            ),
            _ShareButton(url: url, fileName: fileName),
            IconButton(
              tooltip: 'Open in browser',
              icon: const Icon(Icons.open_in_new_rounded),
              onPressed: () => openInBrowser(url),
            ),
          ],
        ),
      ),
    );
  }
}

/// The question's papers, with who shared each, when, and how others rated it.
class _PaperSheet extends StatelessWidget {
  const _PaperSheet({
    required this.papers,
    required this.titles,
    required this.selectedId,
    required this.onPick,
  });

  final List<Submission> papers;
  final Map<int, String> titles;
  final int? selectedId;
  final ValueChanged<int> onPick;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    return ListView(
      shrinkWrap: true,
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
      children: [
        Text(
          '${plural(papers.length, 'paper')} for this exam',
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          'Ranked by likes, then views.',
          style: TextStyle(color: scheme.onSurfaceVariant),
        ),
        const SizedBox(height: 14),
        for (final paper in papers) ...[
          _PaperOption(
            paper: paper,
            title: titles[paper.id]!,
            selected: paper.id == selectedId,
            onTap: () => onPick(paper.id),
          ),
          const SizedBox(height: 8),
        ],
      ],
    );
  }
}

class _PaperOption extends StatelessWidget {
  const _PaperOption({
    required this.paper,
    required this.title,
    required this.selected,
    required this.onTap,
  });

  final Submission paper;
  final String title;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final fg = selected ? scheme.onPrimaryContainer : scheme.onSurface;
    final uploader = paper.uploader;
    final initials = uploader == null
        ? '?'
        : uploader.name
              .split(RegExp(r'\s+'))
              .where((w) => w.isNotEmpty)
              .take(2)
              .map((w) => w[0].toUpperCase())
              .join();
    return Material(
      color: selected ? scheme.primaryContainer : scheme.surfaceContainer,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(
          color: selected ? scheme.primary : Colors.transparent,
          width: 2,
        ),
      ),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            spacing: 12,
            children: [
              CircleAvatar(
                backgroundColor: scheme.secondaryContainer,
                foregroundImage: uploader?.image == null
                    ? null
                    : NetworkImage(uploader!.image!),
                child: Text(
                  initials,
                  style: TextStyle(
                    color: scheme.onSecondaryContainer,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              Expanded(
                child: DefaultTextStyle.merge(
                  style: TextStyle(color: fg),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    spacing: 2,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                      Text(
                        [
                          if (uploader != null) uploader.name,
                          shortDate(paper.createdAt),
                        ].join(' · '),
                        style: const TextStyle(fontSize: 13),
                      ),
                      Wrap(
                        spacing: 12,
                        children: [
                          _Stat(
                            Icons.thumb_up_outlined,
                            compactCount(paper.likeCount),
                            fg,
                          ),
                          _Stat(
                            Icons.visibility_outlined,
                            compactCount(paper.viewCount),
                            fg,
                          ),
                          _Stat(
                            Icons.picture_as_pdf_outlined,
                            fileSize(paper.fileSize),
                            fg,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              if (selected)
                Icon(Icons.check_circle_rounded, color: scheme.primary),
            ],
          ),
        ),
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  const _Stat(this.icon, this.text, this.color);

  final IconData icon;
  final String text;
  final Color color;

  @override
  Widget build(BuildContext context) => Row(
    mainAxisSize: MainAxisSize.min,
    spacing: 3,
    children: [
      Icon(icon, size: 14, color: color.withValues(alpha: 0.8)),
      Text(
        text,
        style: TextStyle(fontSize: 12, color: color.withValues(alpha: 0.8)),
      ),
    ],
  );
}

class _ShareButton extends ConsumerStatefulWidget {
  const _ShareButton({required this.url, required this.fileName});

  final Uri url;
  final String fileName;

  @override
  ConsumerState<_ShareButton> createState() => _ShareButtonState();
}

class _ShareButtonState extends ConsumerState<_ShareButton> {
  var _busy = false;

  Future<void> _share() async {
    setState(() => _busy = true);
    try {
      await sharePaper(
        context,
        dio: ref.read(dioProvider),
        url: widget.url,
        fileName: widget.fileName,
      );
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              "Couldn't download the paper. Check your connection.",
            ),
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return IconButton(
      tooltip: 'Share or save to Files',
      onPressed: _busy ? null : _share,
      icon: _busy
          ? const SizedBox.square(
              dimension: 20,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : const Icon(Icons.share_rounded),
    );
  }
}
