'use client';

import { usePathname } from 'next/navigation';

import { CampaignWrapper } from '../context/campaign';
import { CartWrapper } from '../context/cart';
import { ProductWrapper } from '../context/product';

import Footer from './_components/footer';
import NavBar from './_components/navBar';

const NavbarLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const pathname = usePathname();
  const noNavBar = ['/share'].some((item) => pathname.endsWith(item));

  return (
    <CampaignWrapper>
      <CartWrapper>
        <ProductWrapper>
          <div className="flex flex-col h-full">
            {noNavBar ? null : <NavBar />}
            <main className="py-4 md:py-10 flex-1">{children}</main>
            <Footer />
          </div>
        </ProductWrapper>
      </CartWrapper>
    </CampaignWrapper>
  );
};

export default NavbarLayout;
