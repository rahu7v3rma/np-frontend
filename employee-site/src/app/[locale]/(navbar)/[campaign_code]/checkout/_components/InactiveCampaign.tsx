import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react';
import React from 'react';

import { useI18n } from '@/locales/client';

interface InactiveCampaignProps {
  isOpen: boolean;
  onClose: () => void;
}

const InactiveCampaign: React.FC<InactiveCampaignProps> = ({
  isOpen,
  onClose,
}) => {
  const t = useI18n();
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      hideCloseButton={true}
      classNames={{
        header: 'border-b-[1px] border-[#919EAB33]',
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {t('inactiveLable')}
        </ModalHeader>
        <ModalBody>
          <p className="text-lg mb-4">{t('inactiveCampaign')}</p>
        </ModalBody>
        <ModalFooter className="flex justify-center">
          <Button color="danger" onPress={() => onClose()}>
            {t('closeBtnLabel')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default InactiveCampaign;
