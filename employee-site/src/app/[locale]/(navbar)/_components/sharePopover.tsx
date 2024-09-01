import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
  Tooltip,
} from '@nextui-org/react';
import { Key, useState } from 'react';
import { IoShareSocialSharp } from 'react-icons/io5';

import { useI18n } from '@/locales/client';

type SharePopoverProps = {
  link: string;
  productName?: string;
};

enum ShareOptions {
  COPY_LINK = 'copylink',
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
}

// TODO: Pass link from the parent and use function itemSelectHandler for the selected option
export default function SharePopover({ link, productName }: SharePopoverProps) {
  const t = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [showCopylinkTooltip, setShowCopylinkTooltip] = useState(false);

  const itemSelectHandler = (key: Key) => {
    const encodedUrl = encodeURI(link);
    switch (key) {
      case ShareOptions.COPY_LINK:
        navigator.clipboard.writeText(link);
        setShowCopylinkTooltip(true);
        setTimeout(() => {
          setShowCopylinkTooltip(false);
        }, 1800);
        // Setting timeout more for close dropdown, to let tooltip complete it's transition
        setTimeout(() => {
          setIsOpen(false);
        }, 2000);
        break;
      case ShareOptions.WHATSAPP:
        window.open(`https://wa.me?text=${encodedUrl}`, '_blank');
        break;
      case ShareOptions.EMAIL:
        window.open(
          `mailto:?subject=${productName}&body=${encodedUrl}`,
          '_blank',
        );
        break;
    }
  };

  return (
    <Dropdown
      placement="bottom-start"
      dir="ltr"
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      classNames={{
        content: 'min-w-40',
      }}
    >
      <DropdownTrigger>
        <Button
          variant="bordered"
          size="lg"
          isIconOnly
          className="z-0 h-12 border-1 border-[#2B324C7A] min-w-[64px]"
          onClick={() => setIsOpen(true)}
        >
          <IoShareSocialSharp size={24} />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Dynamic Actions"
        variant="flat"
        classNames={{
          list: 'flex flex-row rtl:flex-row-reverse items-center gap-2',
        }}
        onAction={itemSelectHandler}
        closeOnSelect={false}
      >
        <DropdownItem
          key={ShareOptions.COPY_LINK}
          textValue={ShareOptions.COPY_LINK}
        >
          <Tooltip
            showArrow={true}
            isOpen={showCopylinkTooltip}
            content={t('common.linkCopied')}
            offset={15}
            color="primary"
          >
            <Image
              src="/stack.svg"
              alt="Share Icon"
              width="40"
              height="40"
              className="w-8 h-8"
            />
          </Tooltip>
        </DropdownItem>
        <DropdownItem key={ShareOptions.EMAIL} textValue={ShareOptions.EMAIL}>
          <Image
            src="/email-icon.svg"
            alt="Share Icon"
            width="40"
            height="40"
            className="w-8 h-8"
          />
        </DropdownItem>
        <DropdownItem
          key={ShareOptions.WHATSAPP}
          textValue={ShareOptions.WHATSAPP}
        >
          <Image
            src="/whatsapp-icon.svg"
            alt="Share Icon"
            width="40"
            height="40"
            className="w-8 h-8"
          />
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
