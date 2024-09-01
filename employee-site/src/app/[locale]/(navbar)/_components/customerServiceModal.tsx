'use client';

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from '@nextui-org/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { FaPhone } from 'react-icons/fa6';
import { GoCreditCard, GoGift } from 'react-icons/go';
import { MdOutlineChangeCircle } from 'react-icons/md';

import { useI18n } from '@/locales/client';
import { CUSTOMER_SERVICE_WHATSAPP_NUMBER } from '@/utils/const';

export default function CustomerServiceModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const t = useI18n();
  const { isOpen, onOpen } = useDisclosure();

  useEffect(() => {
    onOpen();
  }, [onOpen]);

  return (
    <Modal
      size="5xl"
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      classNames={{
        footer:
          'border-t-[1px] border-[#919EAB] border-opacity-40 justify-start items-start flex-col',
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="font-bold">
              {t('customerServiceDialog.title')}
            </ModalHeader>
            <ModalBody>
              <p className="font-[600] text-[#363839] text-[16px]">
                {t('customerServiceDialog.description')}
              </p>
              <div className="mt-[6px]">
                <div className="">
                  <div className="flex items-center gap-2">
                    <GoGift size="1.5rem" />
                    <span className="text-sm font-semibold text-[#363839]">
                      {t('customerServiceDialog.giftSelectionTitle')}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-2 list-disc text-sm text-primary-100 mx-[24px] mt-[8px]">
                    <li>
                      {t(
                        'customerServiceDialog.giftSelectionDescriptionPointOne',
                      )}
                    </li>
                    <li>
                      {t(
                        'customerServiceDialog.giftSelectionDescriptionPointTwo',
                      )}
                    </li>
                    <li>
                      {t(
                        'customerServiceDialog.giftSelectionDescriptionPointThree',
                      )}
                    </li>
                    <li>
                      {t(
                        'customerServiceDialog.giftSelectionDescriptionPointFour',
                      )}
                    </li>
                  </ul>
                </div>
                <div className="mt-[24px]">
                  <div className="flex items-center gap-2">
                    <MdOutlineChangeCircle size="1.5rem" />
                    <span className="text-sm font-semibold text-[#363839]">
                      {t('customerServiceDialog.replaceChoicesTitle')}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-2 list-disc text-sm text-primary-100 mx-[24px] mt-[8px]">
                    <li>
                      {t('customerServiceDialog.replaceChoicesDescription')}
                    </li>
                    <li>
                      {t('customerServiceDialog.replaceChoicesDescriptionTwo')}
                    </li>
                  </ul>
                </div>
                <div className="mt-[24px]">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/Value.svg"
                      width={22}
                      height={28}
                      alt="Value"
                    />
                    <span className="text-sm font-semibold text-[#363839]">
                      {t('customerServiceDialog.giftWithPaymentTitle')}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-2 list-disc text-sm text-primary-100  mt-[8px]">
                    {t(
                      'customerServiceDialog.giftWithPaymentDescriptionPointOne',
                    )}
                  </ul>
                </div>
                <div className="mt-[24px]">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/Send.svg"
                      width={22}
                      height={28}
                      alt="Exclamation"
                    />
                    <span className="text-sm font-semibold text-[#363839]">
                      {t('customerServiceDialog.importantNoteTitle')}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-2 list-disc text-sm text-primary-100 mt-[8px]">
                    {t('customerServiceDialog.importantNoteDescription')}
                  </ul>
                </div>
              </div>
              <div className="border border-1 bg-gray-100"></div>
              <div>
                <div className="flex items-center gap-1">
                  <Image
                    src="/Customer-Service.svg"
                    width={24}
                    height={28}
                    alt="Exclamation"
                  />
                  <span className="text-[14px] text-[#363839] font-[600]">
                    {t('button.customerService')}:
                  </span>
                </div>
              </div>
              <p className="text-[14px] font-[600] text-[#363839] my-1 ">
                {t('customerServiceDialog.furtherQuestions')}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  as={Link}
                  target="_blank"
                  href={`https://wa.me/${CUSTOMER_SERVICE_WHATSAPP_NUMBER}`}
                  variant="ghost"
                  dir="ltr"
                >
                  <Image
                    src="/whatsapp-icon.svg"
                    width={22}
                    height={28}
                    alt="whatsapp"
                  />
                  <div className="text-[#2B324C] text-[14px] font-[600]">
                    {t('button.customerService')}
                  </div>
                </Button>
                <Button
                  startContent={<FaPhone />}
                  variant="ghost"
                  dir="ltr"
                  className="text-[#2B324C] text-[14px] font-[600]"
                >
                  +{CUSTOMER_SERVICE_WHATSAPP_NUMBER}
                </Button>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
