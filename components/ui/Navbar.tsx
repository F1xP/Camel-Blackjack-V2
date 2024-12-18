'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import SideNavbar from './SideNavbar';
import UserDropdown from './UserDropdown';
import ThemeDropdown from './ThemeDropdown';
import { useSession } from '../providers/SessionProvider';
import ImageWithFallback from '../image-with-fall-back';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

const googleScopes =
  'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/user.gender.read';

const googleAuthURL = `https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=303896066620-5ppne30mk87bvo92edo519v2705rlojb.apps.googleusercontent.com&redirect_uri=${encodeURIComponent(
  `${baseUrl}/api/auth/google/callback`
)}&scope=${encodeURIComponent(googleScopes)}&access_type=offline`;

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const location = usePathname();
  const { user } = useSession();

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

  return (
    <nav className="fixed w-full h-12 bg-primary dark:bg-dark_primary flex px-4 sm:px-14 md:px-18 lg:px-44 xl:px-64 flex-row items-center z-20">
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
              className={`text-accent small-caps text-[1.2rem] font-bold hover:text-text dark:hover:text-dark_text hover:bg-secondary dark:hover:bg-dark_secondary px-4 h-full flex justify-center items-center transition-all duration-300 ${
                link.href === location
                  ? 'border-b-3 border-secondary dark:border-dark_secondary text-text dark:text-dark_text'
                  : 'border-none'
              }`}>
              {link.name}
            </Link>
          );
        })}
      </div>
      <ThemeDropdown />
      {!user ? (
        <Link
          href={googleAuthURL}
          className="flex-row hidden md:flex h-10 justify-center items-center gap-1 border rounded-md text-text dark:text-dark_text border-secondary dark:border-dark_secondary text-[1.2rem] hover:bg-secondary dark:hover:bg-dark_secondary cursor-pointer transition-all duration-300">
          <div className="bg-secondary dark:bg-dark_secondary h-10 p-2 flex justify-center items-center rounded-md rounded-r-none">
            <Image
              src={'/Google.svg'}
              alt={''}
              width={20}
              height={20}
            />
          </div>
          <p className="font-bold p-1 px-3 small-caps">Sign In </p>
        </Link>
      ) : (
        <div className="relative hidden md:flex">
          <button
            className="flex-row flex h-10 justify-center items-center gap-1 border rounded-md text-text dark:text-dark_text border-secondary dark:border-dark_secondary text-[1.2rem] hover:bg-secondary dark:hover:bg-dark_secondary cursor-pointer transition-all duration-300"
            onClick={(e) => {
              setIsDropdownOpen((current) => !current);
              e.stopPropagation();
            }}>
            <div className="bg-secondary dark:bg-dark_secondary h-10 p-2 flex justify-center items-center rounded-md rounded-r-none flex-shrink-0">
              <ImageWithFallback
                type="user"
                src={'/CamelBlackjackLogo.png'}
                alt={'userImage'}
                className="rounded-full"
              />
            </div>
            <p className="font-bold p-1 px-3 small-caps whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] lg:max-w-xs mb-0.5">
              {user?.name || ''}
            </p>
          </button>
        </div>
      )}
    </nav>
  );
}
