import { Link } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { FaChevronLeft } from 'react-icons/fa6';

import { useI18n } from '@/locales/client';

type BackButtonProps = {
  text?: string;
  href?: string;
};

export default function BackLink({ text, href }: BackButtonProps) {
  const t = useI18n();
  const router = useRouter();

  return (
    <Link
      color="primary"
      size="sm"
      className="font-bold cursor-pointer gap-1"
      onPress={() => {
        if (href) {
          router.replace(href);
          return;
        }
        router.back();
      }}
    >
      <FaChevronLeft className="rtl:rotate-180" />
      {text || t('common.back')}
    </Link>
  );
}
