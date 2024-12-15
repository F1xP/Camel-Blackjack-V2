import Image from 'next/image';
import Link from 'next/link';
import { validateSessionToken } from '@/lib/auth';
import ThemeDropdown from './theme-dropdown';
import NavbarUserDropdown from './user-dropdown';
import SideNavbar from './side-navbar';

export default async function Navbar() {
  const { user } = await validateSessionToken();

  return (
    <nav className="bg-gradient flex-center md:px-18 sticky top-0 z-20 h-24 w-full flex-row px-4 sm:px-14 lg:px-44 xl:px-64">
      <div className="flex-center ml-auto gap-2">
        <ThemeDropdown />
        <NavbarUserDropdown
          isSignedIn={!!user}
          id={user?.id}
          role={user?.role}
        />
      </div>
      <SideNavbar />
    </nav>
  );
}
