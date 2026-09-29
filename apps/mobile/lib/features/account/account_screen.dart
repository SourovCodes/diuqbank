import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../api/api.dart';
import '../../data/settings.dart';
import '../../theme/theme.dart';

final _versionProvider = FutureProvider<String>(
  (ref) async => (await PackageInfo.fromPlatform()).version,
);

class AccountScreen extends ConsumerWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final version = ref.watch(_versionProvider).value;

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
          children: [
            Text('Account', style: expressive(40, color: scheme.onSurface)),
            const SizedBox(height: 20),
            const _SignInCard(),
            const SizedBox(height: 24),
            Text(
              'Appearance',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 10),
            SegmentedButton<ThemeMode>(
              segments: const [
                ButtonSegment(
                  value: ThemeMode.system,
                  icon: Icon(Icons.contrast_rounded),
                  label: Text('System'),
                ),
                ButtonSegment(
                  value: ThemeMode.light,
                  icon: Icon(Icons.light_mode_rounded),
                  label: Text('Light'),
                ),
                ButtonSegment(
                  value: ThemeMode.dark,
                  icon: Icon(Icons.dark_mode_rounded),
                  label: Text('Dark'),
                ),
              ],
              selected: {ref.watch(appearanceProvider)},
              showSelectedIcon: false,
              onSelectionChanged: (s) =>
                  ref.read(appearanceProvider.notifier).set(s.single),
            ),
            const SizedBox(height: 24),
            Column(
              spacing: 2,
              children: [
                for (final (i, (icon, label, path)) in const [
                  (Icons.info_outline_rounded, 'About QuestionBank', '/about'),
                  (Icons.mail_outline_rounded, 'Contact us', '/contact'),
                  (Icons.policy_outlined, 'Privacy policy', '/privacy'),
                  (Icons.gavel_rounded, 'Terms of use', '/terms'),
                ].indexed)
                  Material(
                    color: scheme.surfaceContainerLow,
                    borderRadius: BorderRadius.vertical(
                      top: Radius.circular(i == 0 ? 20 : 4),
                      bottom: Radius.circular(i == 3 ? 20 : 4),
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: ListTile(
                      leading: Icon(icon, color: scheme.onSurfaceVariant),
                      title: Text(label),
                      trailing: Icon(
                        Icons.open_in_new_rounded,
                        size: 18,
                        color: scheme.onSurfaceVariant,
                      ),
                      onTap: () => launchUrl(
                        Uri.parse('$apiBaseUrl$path'),
                        mode: LaunchMode.inAppBrowserView,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 20),
            Text(
              [
                if (version != null) 'Version $version',
                'diuqbank.com',
              ].join(' · '),
              textAlign: TextAlign.center,
              style: theme.textTheme.bodySmall?.copyWith(
                color: scheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// What an account is for. Sign-in itself arrives in an update (it needs mobile
/// sign-in support in the API), so the button is shown but disabled.
class _SignInCard extends StatelessWidget {
  const _SignInCard();

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Card.filled(
      color: scheme.primaryContainer,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          spacing: 12,
          children: [
            Text(
              'Share what you’ve got',
              style: expressive(
                20,
                width: 110,
                weight: 700,
                color: scheme.onPrimaryContainer,
              ),
            ),
            Text(
              'An account lets you upload papers, like the useful ones and report '
              'problems. Reading never needs one.',
              style: TextStyle(color: scheme.onPrimaryContainer, height: 1.4),
            ),
            const FilledButton(
              onPressed: null,
              child: Text('Continue with Google'),
            ),
            Text(
              'Sign-in is coming in an update.',
              style: TextStyle(
                fontSize: 13,
                color: scheme.onPrimaryContainer.withValues(alpha: 0.8),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
