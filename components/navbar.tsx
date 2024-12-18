import ThemeDropdown from './theme-dropdown';
import NavbarUserDropdown from './user-dropdown';
import SideNavbar from './side-navbar';
import Link from 'next/link';
import Image from 'next/image';
import { validateSessionToken } from '@/lib/auth';

const Links = [
  {
    name: 'Play',
    href: '/play',
  },
  {
    name: 'Leaderboard',
    href: '/leaderboard',
  },
];

export default async function Navbar() {
  const { user } = await validateSessionToken();

  return (
    <nav className="bg-primary dark:bg-dark_primary flex-center md:px-18 sticky top-0 z-20 h-16 w-full flex-row px-4 sm:px-14 lg:px-44 xl:px-64">
      <Link
        className="flex flex-row gap-2 h-full justify-center items-center"
        href={'/'}>
        <Image
          src={'/CamelBlackjackLogo.png'}
          alt={''}
          width={33}
          height={33}
        />
        <p className="text-accent text-[1.3rem] font-black small-caps text-3xl hidden sm:block whitespace-nowrap">
          <span className="text-text dark:text-dark_text">C</span>amel{' '}
          <span className="text-text dark:text-dark_text">B</span>lackjack
        </p>
      </Link>
      <div className="hidden h-full ml-5 md:flex flex-row justify-center items-center">
        {Links.map((link) => {
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`text-accent small-caps text-[1.2rem] font-bold hover:text-text dark:hover:text-dark_text hover:bg-secondary dark:hover:bg-dark_secondary px-4 h-full flex justify-center items-center transition-all duration-300`}>
              {link.name}
            </Link>
          );
        })}
      </div>

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
