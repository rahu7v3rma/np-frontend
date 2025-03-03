import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@nextui-org/react';
import clsx from 'clsx';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useContext, useState } from 'react';
import { FaRotateRight } from 'react-icons/fa6';
import { IoClose } from 'react-icons/io5';

import { useCurrentLocale, useI18n } from '@/locales/client';

import { ProductContext } from '../../context/product';

import FilterAccordion from './filterAccordion';

type Props = {
  isOpen: boolean;
  toggleShowFilter: () => void;
  campaignCode: string;
};

export default function FilterSheet({
  campaignCode,
  isOpen,
  toggleShowFilter,
}: Props) {
  const t = useI18n();
  const locale = useCurrentLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const { handleResetFilter } = useContext(ProductContext);
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState('');

  const rawBudget = Number(searchParams?.get('b')) || undefined;
  const budget =
    rawBudget === 1 || rawBudget === 2 || rawBudget === 3
      ? rawBudget
      : undefined;

  const isAllTab = !searchParams.get('b');
  const isHe = locale === 'he';
  const isEn = locale === 'en';

  const triggerToast = useCallback(
    (text: string) => {
      if (!showToast) {
        setToastText(text);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 5000);
      }
    },
    [showToast],
  );

  const FilterToast = useCallback(
    ({ className }: { className?: string }) =>
      showToast && (
        <div
          className={clsx(
            'z-100 absolute w-[370px] top-[80px] right-[8px] shadow-[-20px_20px_40px_-4px_rgba(145, 158, 171, 0.24)] p-4 rounded-[10px] bg-[#f4f4f4]',
            className,
          )}
        >
          <div className="text-sm font-normal leading-5 text-[#363839]">
            {toastText}
          </div>
          {toastText === t('OpenbudgetMessage') && (
            <div className="flex justify-end gap-2 mt-5" dir="ltr">
              <Button
                variant="faded"
                size="sm"
                className="font-semibold"
                onClick={() => setShowToast(false)}
              >
                {t('button.continue')}
              </Button>
              <Button
                color="primary"
                size="sm"
                className="font-semibold"
                onClick={() => {
                  const sp = new URLSearchParams(searchParams);
                  sp.delete('b');
                  router.replace(`${path}?${sp.toString()}`);
                  setShowToast(false);
                }}
              >
                {t('button.uncheck')}
              </Button>
            </div>
          )}
        </div>
      ),
    [toastText, showToast, searchParams, path, router, t],
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        backdrop="transparent"
        size="full"
        hideCloseButton
        classNames={{
          wrapper:
            'flex justify-start h-[calc(100vh-5rem)] mt-20 max-w-full sm:max-w-sm shadow-2xl',
          base: '!max-w-full sm:!max-w-sm !h-full backdrop-blur-md',
          header: 'border-b-1',
        }}
        motionProps={{
          variants: {
            enter: {
              x: 0,
              opacity: 1,
              transition: {
                duration: 0.3,
                ease: 'easeOut',
              },
            },
            exit: {
              x: locale === 'en' ? -50 : 50,
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: 'easeIn',
              },
            },
          },
        }}
        className="rounded-md max-w-sm w-full h-screen max-h-screen"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex justify-between items-center w-full">
              <span className="hidden sm:block">{t('common.filters')}</span>
              <div className="flex flex-row-reverse sm:flex-row justify-between items-center flex-1 sm:flex-none">
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  className="rounded-full"
                  onClick={handleResetFilter}
                >
                  <FaRotateRight size={16} color="#363839cc" />
                </Button>
                <span className="sm:hidden">{t('common.filters')}</span>
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  className="rounded-full"
                  onClick={toggleShowFilter}
                >
                  <IoClose size={20} color="#363839cc" />
                </Button>
              </div>
            </div>
            {isHe && <FilterToast className="[&&]:top-0" />}
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex-1">
                <FilterAccordion
                  campaignCode={campaignCode}
                  triggerToast={triggerToast}
                />
              </div>
              <Button
                color="primary"
                className="sm:hidden"
                onClick={toggleShowFilter}
              >
                {t('filter.showResults')}
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
      {isEn && <FilterToast />}
    </>
  );
}
