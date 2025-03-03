import Footer from '../../(navbar)/_components/footer';
import NavBar from '../../(navbar)/_components/navBar';

const NavbarLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <NavBar isAuthenticated={false} />
      <main className="py-4 md:py-10">{children}</main>
      <Footer />
    </>
  );
};

export default NavbarLayout;
