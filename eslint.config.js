const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  globalIgnores(['.expo/*', 'dist/*', 'node_modules/*']),
  expoConfig,
  {
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/features/profile/ProfileShared',
              importNames: [
                'AppLanguage',
                'PreferenceContext',
                'PreferenceContextValue',
                'ThemePalette',
                'formatCountText',
                'getSafeTranslation',
                'getThemePalette',
                'translations',
                'translateUiText',
                'usePreferenceContext',
                'usePreferenceValue',
              ],
              message: 'Import shared preference utilities from @/shared/preferences instead.',
            },
          ],
        },
      ],
    },
  },
]);
