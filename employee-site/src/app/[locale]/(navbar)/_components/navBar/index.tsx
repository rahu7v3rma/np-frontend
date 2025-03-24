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
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { IoIosAlert } from 'react-icons/io';

import { CartContext } from '@/app/[locale]/context/cart';
import { useCurrentLocale, useI18n } from '@/locales/client';
import MultiSelectPrice from '@/shared/MultiSelectPrice';
import { isQuickOfferCampaign } from '@/utils/campaign';
import { CUSTOMER_SERVICE_WHATSAPP_NUMBER } from '@/utils/const';

import { CampaignContext } from '../../../context/campaign';
import useBreakpoint from '../../../hooks/useBreakpoint';
import Cart from '../cart';
import CustomerServiceModal from '../customerServiceModal';
import LanguageSwitcher from '../languageSwitcher';
import QuickOfferProducts from '../quikOfferProducts';

const NavBar = ({ isAuthenticated = true }) => {
  const t = useI18n();
  const locale = useCurrentLocale();

  const { campaignDetails, campaignType } = useContext(CampaignContext);
  const { cart, isShowCart, showCart, showOfferList, showList } =
    useContext(CartContext);
  const breakpoint = useBreakpoint();
  const isScrolling = useRef(false);
  const scrollingTimeout = useRef<NodeJS.Timeout>();

  const [isModalVisible, setIsModalVisible] = useState(false);

  const budget = campaignDetails?.budget_per_employee;

  const cartCloseHandler = useCallback(() => {
    showCart(false);
  }, [showCart]);

  const quickOfferCloseHandler = useCallback(() => {
    showList(false);
  }, [showList]);

  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => {
    showCart(true);
  }, [showCart]);

  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);
  const cartButton = useMemo(() => {
    if (['xs', 'sm'].includes(breakpoint)) {
      return (
        <div className="flex items-center" onClick={openCart}>
          <Badge
            size="sm"
            content={cartItemCount}
            shape="rectangle"
            showOutline={false}
            isInvisible={cartItemCount === 0}
            className={`px-3 top-[3px] right-[-2px] bg-red-500 text-white font-bold ${cartItemCount >= 10 ? 'px-1' : 'px-2.5'}`}
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
              className={`top-[3px] right-[-2px] bg-red-500 text-white font-bold ${cartItemCount >= 10 ? 'px-1' : 'px-2.5'}`}
            >
              <Icon icon="solar:cart-3-bold" fontSize={20} />
            </Badge>
          }
          className="bg-primary-100 aria-expanded:opacity-100 aria-expanded:bg-primary"
          onClick={openCart}
        >
          <span className="ml-1">
            {budget && <MultiSelectPrice price={budget} alignLeft />}
          </span>
        </Button>
      );
    }
  }, [breakpoint, budget, cart, openCart]);

  useEffect(() => {
    const handleScroll = () => {
      isScrolling.current = true;
      clearTimeout(scrollingTimeout.current);
      scrollingTimeout.current = setTimeout(() => {
        isScrolling.current = false;
      }, 200);
    };

    const nextUIProvider = document.getElementById('nextUIProvider');
    nextUIProvider?.addEventListener('scroll', handleScroll);
    return () => {
      nextUIProvider?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const _checkLng = locale === 'en';
  return (
    <>
      <nav className="bg-white fixed sm:top-0 top-0 w-full z-50">
        <div className="relative w-full md:w-[664px] lg:w-[960px] xl:w-[1216px] 2xl:w-[1440px] mx-auto px-4 md:px-0">
          <div className={`flex h-20 items-center justify-between`}>
            <div className="flex">
              <Link href="/" legacyBehavior>
                <a
                  onClick={() => {
                    sessionStorage.removeItem('products_screen_scrollPosition');
                  }}
                >
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
                <a
                  onClick={() => {
                    sessionStorage.removeItem('products_screen_scrollPosition');
                  }}
                >
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
                  className="hidden sm:flex cursor-pointer text-primary-100 hover:opacity-90 rotate-180"
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
                  showArrow
                  className={`before:right-[${_checkLng ? '10px' : '87%'}] before:absolute before:content-[''] before:w-[18px] before:h-[18px] before:rounded-[3px] before:top-[-5px] before:bg-white/100 before:shadow-[0px_0px_3px_0px_rgba(0,0,0,.1)] before:rotate-45 before:z-[1] z-[1] relative z-[1] shadow-[-20px_20px_40px_-4px_#919EAB3D] bg-white rounded-[10px] mt-1  ${_checkLng ? 'left-[6px]' : 'right-[6px]'}`}
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
                        {campaignDetails?.employee_name ||
                          campaignDetails?.name}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                {isQuickOfferCampaign(campaignType ?? '') && (
                  <>
                    <Popover
                      placement={
                        locale === 'en' ? 'bottom-start' : 'bottom-end'
                      }
                      isOpen={showOfferList}
                      shouldCloseOnInteractOutside={(element) =>
                        element && element.getAttribute('id') == 'addToList'
                      }
                      onOpenChange={(open) => {
                        setTimeout(() => {
                          if (!isScrolling.current) {
                            showList(open);
                          }
                        }, 100);
                      }}
                      classNames={{
                        content: 'p-0 mt-6 h-[calc(100vh-80px)]',
                      }}
                      offset={0}
                    >
                      <PopoverTrigger className="relative">
                        <div className="relative">
                          <Icon
                            icon="solar:bill-list-bold"
                            className="cursor-pointer text-primary-100 hover:opacity-90"
                            id="addToList"
                            fontSize={28}
                          />
                          {cart.length > 0 && (
                            <span className="absolute top-[-3px] right-[-10px] bg-alert w-5 h-[15px] rounded-[388px] font-bold text-xs text-white text-center">
                              {cartItemCount}
                            </span>
                          )}
                        </div>
                      </PopoverTrigger>
                      <PopoverContent>
                        <QuickOfferProducts onClose={quickOfferCloseHandler} />
                      </PopoverContent>
                    </Popover>
                  </>
                )}
                {campaignDetails?.campaign_type === 'WALLET' ? (
                  <>
                    {cartButton}
                    <Popover
                      placement={
                        locale === 'en' ? 'bottom-end' : 'bottom-start'
                      }
                      isOpen={isShowCart}
                      shouldCloseOnInteractOutside={(element) =>
                        !(
                          element &&
                          element.getAttribute('id') == 'addToCartButton'
                        )
                      }
                      onOpenChange={(open) => {
                        setTimeout(() => {
                          if (!isScrolling.current) {
                            showCart(open);
                          }
                        }, 100);
                      }}
                      classNames={{
                        content: 'p-0 ltr:translate-x-3 rtl:-translate-x-3',
                      }}
                      offset={0}
                    >
                      <PopoverTrigger className="relative">
                        <button className="absolute top-[82px] md:top-20 ltr:right-[-115px] rtl:left-[-115px]  h-0 w-0" />
                      </PopoverTrigger>
                      <PopoverContent>
                        <Cart onClose={cartCloseHandler} />
                      </PopoverContent>
                    </Popover>
                  </>
                ) : (
                  !isQuickOfferCampaign(campaignType ?? '') &&
                  campaignDetails?.employee_order_reference === null &&
                  campaignDetails?.product_selection_mode === 'MULTIPLE' && (
                    <>
                      {cartButton}
                      <Popover
                        placement={
                          locale === 'en' ? 'bottom-end' : 'bottom-start'
                        }
                        isOpen={isShowCart}
                        shouldCloseOnInteractOutside={(element) =>
                          !(
                            element &&
                            element.getAttribute('id') == 'addToCartButton'
                          )
                        }
                        onOpenChange={(open) => {
                          setTimeout(() => {
                            if (!isScrolling.current) {
                              showCart(open);
                            }
                          }, 100);
                        }}
                        classNames={{
                          content: 'p-0 ltr:translate-x-3 rtl:-translate-x-3',
                        }}
                        offset={0}
                      >
                        <PopoverTrigger className="relative">
                          <button className="absolute top-[82px] md:top-20 ltr:right-[-115px] rtl:left-[-115px]  h-0 w-0" />
                        </PopoverTrigger>
                        <PopoverContent>
                          <Cart onClose={cartCloseHandler} />
                        </PopoverContent>
                      </Popover>
                    </>
                  )
                )}
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Image
                      src="/menu-item.svg"
                      alt="Menu"
                      width={32}
                      height={32}
                      className="flex sm:hidden cursor-pointer hover:opacity-90"
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
                          className="cursor-pointer text-primary-100 hover:opacity-90 mx-2 rotate-180"
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
