'use client';

import { Icon } from '@iconify/react';
import {
  Badge,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@nextui-org/react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useContext, useMemo, useState } from 'react';
import { IoIosAlert } from 'react-icons/io';

import { CartContext } from '@/app/[locale]/context/cart';
import { useCurrentLocale, useI18n } from '@/locales/client';
import MultiSelectPrice from '@/shared/MultiSelectPrice';
import { CUSTOMER_SERVICE_WHATSAPP_NUMBER } from '@/utils/const';

import { CampaignContext } from '../../../context/campaign';
import useBreakpoint from '../../../hooks/useBreakpoint';
import Cart from '../cart';
import CustomerServiceModal from '../customerServiceModal';
import LanguageSwitcher from '../languageSwitcher';

const NavBar = ({ isAuthenticated = true }) => {
  const t = useI18n();
  const locale = useCurrentLocale();

  const { campaignDetails } = useContext(CampaignContext);
  const { cart } = useContext(CartContext);
  const breakpoint = useBreakpoint();

  const [showCart, setShowCart] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const budget = campaignDetails?.budget_per_employee;

  const cartCloseHandler = () => {
    setShowCart(false);
  };

  const [isOpen, setIsOpen] = useState(false);

  const cartButton = useMemo(() => {
    const cartItemCount = cart.reduce(
      (count, item) => count + item.quantity,
      0,
    );

    if (['xs', 'sm'].includes(breakpoint)) {
      return (
        <div className="flex items-center">
          <Badge
            size="sm"
            content={cartItemCount}
            shape="rectangle"
            showOutline={false}
            isInvisible={cartItemCount === 0}
            className="px-3 top-[3px] right-[-2px] bg-red-500 text-white font-bold"
          >
            <Icon
              icon="solar:cart-3-bold"
              className="cursor-pointer text-primary-100"
              fontSize={20}
            />
          </Badge>
        </div>
      );
    } else {
      return (
        <Button
          color="primary"
          size="sm"
          dir="ltr"
          startContent={
            <Badge
              size="sm"
              content={cartItemCount}
              shape="rectangle"
              showOutline={false}
              isInvisible={cartItemCount === 0}
              className="px-2.5 top-[3px] right-[-2px] bg-red-500 text-white font-bold"
            >
              <Icon icon="solar:cart-3-bold" fontSize={20} />
            </Badge>
          }
          className="bg-primary-100 aria-expanded:opacity-100 aria-expanded:bg-primary"
        >
          <span className="ml-1">
            {budget && <MultiSelectPrice price={budget} />}
          </span>
        </Button>
      );
    }
  }, [breakpoint, budget, cart]);

  return (
    <>
      <nav className="bg-white sticky top-0 z-50">
        <div className="relative w-full md:w-[664px] lg:w-[960px] xl:w-[1216px] 2xl:w-[1440px] mx-auto px-4 md:px-0">
          <div className={`flex h-20 items-center justify-between`}>
            <div className="flex">
              <Link href="/" legacyBehavior>
                <a>
                  <Image
                    className="relative object-contain w-auto h-full max-h-10 hidden md:block"
                    src={
                      campaignDetails?.organization_logo_image ?? '/logo.svg'
                    }
                    alt="Organization logo"
                    width={159}
                    height={43}
                    priority
                  />
                </a>
              </Link>

              <Link href="/" legacyBehavior>
                <a>
                  <Image
                    className="relative md:object-contain w-auto h-full md:max-h-7 block md:hidden"
                    src={
                      campaignDetails?.organization_logo_image ??
                      '/logo-mobile.svg'
                    }
                    alt="Organization logo"
                    width={29.36}
                    height={29.4}
                    priority
                  />
                </a>
              </Link>
            </div>
            {isAuthenticated && (
              <div className="flex items-center justify-center gap-4 mr-2 md:mr-0">
                <LanguageSwitcher />
                <IoIosAlert
                  size={32}
                  className="hidden sm:flex cursor-pointer text-primary-100 hover:opacity-90"
                  onClick={() => setIsModalVisible(true)}
                />
                <Link
                  target="_blank"
                  href={`https://wa.me/${CUSTOMER_SERVICE_WHATSAPP_NUMBER}`}
                  className="hidden sm:flex "
                >
                  <Image
                    src="/whatsapp.svg"
                    alt="whatsapp"
                    width={32}
                    height={32}
                    className="cursor-pointer hover:opacity-90"
                  />
                </Link>
                <Popover
                  isOpen={isOpen}
                  onOpenChange={setIsOpen}
                  placement={locale === 'en' ? 'bottom-end' : 'bottom-start'}
                  className={`before:right-[10px] before:absolute before:content-[''] before:w-[15px] before:h-[15px] before:rounded-[4px] before:top-[-5px] before:bg-white/100 before:shadow-[0px_0px_3px_0px_rgba(0,0,0,.1)] before:rotate-45 before:z-[-1] z-[1] relative z-[1] shadow-[-20px_20px_40px_-4px_#919EAB3D] bg-white`}
                >
                  <PopoverTrigger>
                    <div
                      onMouseEnter={() => setIsOpen(true)}
                      onMouseLeave={() => setIsOpen(false)}
                    >
                      <Image
                        src="/user-icon.svg"
                        alt="user"
                        width={32}
                        height={32}
                        className="cursor-pointer hover:opacity-90"
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <div className="flex items-center p-4 min-w-52 before:content-[''] before:w-[80px] before:h-[80px] before:absolute before:bg-[#FF56301F] before:rounded-full before:blur-[27px] before:bottom-[-25px] before:left-[-25px] overflow-hidden p-1 after:content-[''] after:absolute after:bg-[#CFD5E51F] after:rounded-full after:blur-[27px] after:top-[-10px] after:right-[-10px] after:w-[80px] after:h-[80px] z-[1] before:z-[-1] after:z-[-1] rounded-large bg-white">
                      <div className="font-semibold ps-2 text-[14px] font-['Public_Sans']">
                        {campaignDetails?.employee_name}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                {campaignDetails?.employee_order_reference === null &&
                  campaignDetails?.product_selection_mode === 'MULTIPLE' && (
                    <Popover
                      placement="bottom-end"
                      isOpen={showCart}
                      onOpenChange={(open) => setShowCart(open)}
                      classNames={{
                        content: 'p-0',
                      }}
                    >
                      <PopoverTrigger>{cartButton}</PopoverTrigger>
                      <PopoverContent>
                        <Cart onClose={cartCloseHandler} />
                      </PopoverContent>
                    </Popover>
                  )}
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Image
                      src="/menu-item.svg"
                      alt="Menu"
                      width={32}
                      height={32}
                      className="flex sm:hidden ml-4 rtl:mr-4 cursor-pointer hover:opacity-90"
                    />
                  </DropdownTrigger>
                  <DropdownMenu
                    variant="flat"
                    onAction={(key) => {
                      if (key === 'info') {
                        setIsModalVisible(true);
                      }
                    }}
                  >
                    <DropdownItem key="cs">
                      <div className="flex">
                        <Link
                          target="_blank"
                          href={`https://wa.me/${CUSTOMER_SERVICE_WHATSAPP_NUMBER}`}
                          className="flex"
                        >
                          <Image
                            src="/whatsapp.svg"
                            alt="Whatsapp"
                            width={20}
                            height={20}
                            className="mx-2"
                          />
                          <span>{t('customerService')}</span>
                        </Link>
                      </div>
                    </DropdownItem>
                    <DropdownItem key="info">
                      <div className="flex">
                        <IoIosAlert
                          size={20}
                          className="cursor-pointer text-primary-100 hover:opacity-90 mx-2"
                        />
                        <span>{t('common.information')}</span>
                      </div>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            )}
            {!isAuthenticated && (
              <div className={`flex items-center justify-center`}>
                <LanguageSwitcher />
              </div>
            )}
          </div>
        </div>
      </nav>
      {isModalVisible && (
        <CustomerServiceModal onClose={() => setIsModalVisible(false)} />
      )}
    </>
  );
};

export default NavBar;
