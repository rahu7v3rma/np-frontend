import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
  Tooltip,
} from '@nextui-org/react';
import { useParams } from 'next/navigation';
import { Key, useCallback, useContext, useState } from 'react';
import { IoShareSocialSharp } from 'react-icons/io5';

import { useI18n } from '@/locales/client';
import { updateShareItems } from '@/services/api';

import { CampaignContext } from '../../context/campaign';
import { CartContext } from '../../context/cart';

type SharePopoverProps = {
  link: string;
  height?: boolean;
  list?: boolean;
};

enum ShareOptions {
  COPY_LINK = 'copylink',
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
}

export default function SharePopover({
  link,
  height,
  list,
}: SharePopoverProps) {
  const t = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const { id } = useParams<{
    id: string;
  }>();
  const { cart } = useContext(CartContext);

  const [cartdata, setCartData] = useState();
  const [showCopylinkTooltip, setShowCopylinkTooltip] = useState(false);
  const { campaign_code } = useParams<{ campaign_code: string }>();
  const { campaignType } = useContext(CampaignContext);

  const cart_ids = cart.map((item) => item.product.id.toString());
  let share_type = link.includes(list ? 'list' : 'cart') ? 'Cart' : 'Product';
  let product_ids: string[] = share_type === 'Cart' ? cart_ids : [id];

  const updateCartItem = useCallback(async () => {
    try {
      const response = await updateShareItems(
        campaign_code,
        product_ids,
        share_type,
        campaignType,
      );
      setCartData(response);
      return response; // Return the response here to use it later
    } catch (err) {
      return null; // Return null in case of an error
    }
  }, [campaign_code, share_type, product_ids]);

  const itemSelectHandler = async (key: Key) => {
    // Await the updateCartItem and store the response
    const updatedCartData = await updateCartItem();

    // Check if the response is valid and then construct the URL
    if (updatedCartData) {
      const sharedLink = `${link}?share=${updatedCartData?.share_id}`;
      const encodedUrl = encodeURI(sharedLink);
      const isFromCart = link.includes('cart-details') || link.includes('cart');
      let emailSubject = isFromCart ? 'Cart' : 'Product';

      switch (key) {
        case ShareOptions.COPY_LINK:
          navigator.clipboard.writeText(encodedUrl);
          setShowCopylinkTooltip(true);
          setTimeout(() => {
            setShowCopylinkTooltip(false);
          }, 1800);
          setTimeout(() => {
            setIsOpen(false);
          }, 2000);
          break;
        case ShareOptions.WHATSAPP:
          window.open(`https://wa.me?text=${encodedUrl}`, '_blank');
          break;
        case ShareOptions.EMAIL:
          window.open(
            `mailto:?subject=${emailSubject}&body=${encodedUrl}`,
            '_blank',
          );
          break;
      }
    }
  };

  return (
    <Dropdown
      placement="top-start"
      dir="ltr"
      showArrow
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      classNames={{
        content: 'min-w-40 bg-gradient-to-r from-[#FBF3F4] to-white',
      }}
    >
      <DropdownTrigger>
        <Button
          variant="bordered"
          size="lg"
          isIconOnly
          className={`z-0 ${height ? 'h-10' : 'h-12'} border-1 border-[#2B324C7A] min-w-[64px]`}
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
