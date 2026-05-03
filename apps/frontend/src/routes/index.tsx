import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const { t, i18n } = useTranslation();

  async function onTranslateButtonClick() {
    if (i18n.resolvedLanguage === 'en-US') {
      await i18n.changeLanguage('zh-Hant');
    } else {
      await i18n.changeLanguage('en-US');
    }
  }

  const list = ['part1', 'part2'];

  return (
    <div>
      <div className="flex min-h-[60dvh] flex-col items-center justify-center bg-blue-300 font-bold">
        <h1
          data-test="index-title"
          className="text-6xl text-white"
        >
          {t('index.title', { ns: 'translation' })}
        </h1>
        <h2 className="text-2xl text-white">{t('test', { ns: 'test' })}</h2>
        <ul>
          {list.map((item) => (
            <li key={item}>{t(`index.description.${item}`, { ns: 'translation' })}</li>
          ))}
        </ul>
        <Button
          type="button"
          onClick={onTranslateButtonClick}
          data-test="translate-btn"
        >
          幫我翻譯翻譯
        </Button>
      </div>
    </div>
  );
}
