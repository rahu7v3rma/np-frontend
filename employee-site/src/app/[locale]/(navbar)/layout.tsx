'use client';

import { usePathname } from 'next/navigation';

import { CampaignWrapper } from '../context/campaign';
import { CartWrapper } from '../context/cart';

import Footer from './_components/footer';
import NavBar from './_components/navBar';

const NavbarLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const pathname = usePathname();
  const noNavBar = ['/share'].some((item) => pathname.endsWith(item));

  return (
    <CampaignWrapper>
      <CartWrapper>
        {noNavBar ? null : <NavBar />}
        <main className="py-4 md:py-10">{children}</main>
        <Footer />
      </CartWrapper>
    </CampaignWrapper>
  );
};

export default NavbarLayout;
