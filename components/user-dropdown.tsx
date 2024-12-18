import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { MessageSquare, UserCircle } from 'lucide-react';
import { RxGear } from 'react-icons/rx';
import { BsPersonWorkspace } from 'react-icons/bs';
import { RiAdminLine } from 'react-icons/ri';
import { cn } from '@/lib/utils';
import { Role } from '@/drizzle/schema/db-enums';
import SignOutButton from './signout-button';
import ImageWithFallback from './image-with-fall-back';
import { buttonVariants } from './ui/Button';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

const googleScopes =
  'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/user.gender.read';

const googleAuthURL = `https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=303896066620-5ppne30mk87bvo92edo519v2705rlojb.apps.googleusercontent.com&redirect_uri=${encodeURIComponent(
  `${baseUrl}/api/auth/google/callback`
)}&scope=${encodeURIComponent(googleScopes)}&access_type=offline`;

const NavbarUserDropdown: React.FC<{ isSignedIn: boolean; id: string | undefined; role: Role | undefined }> = async ({
  isSignedIn,
  id,
  role,
}) => {
  return (
    <>
      {!isSignedIn ? (
        <Link
          className={cn(buttonVariants({ size: 'sm' }), 'h-10')}
          href={googleAuthURL}>
          SIGN IN
        </Link>
      ) : (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger>
            <div className="flex-center border-accent h-10 w-10 overflow-hidden rounded-sm border">
              <ImageWithFallback
                type="user"
                src={`https://djfbucket.s3.eu-north-1.amazonaws.com/User/${id}`}
                alt={'userImage'}
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link
                className="flex-center w-full flex-row"
                href={`/users/single/${id}`}>
                <UserCircle
                  size={20}
                  className="mr-auto"
                />
                <span className="mr-auto">Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                className="flex-center w-full flex-row"
                href={'/jobs/myjobs'}>
                <BsPersonWorkspace
                  size={20}
                  className="mr-auto"
                />
                <span className="mr-auto">My Jobs</span>
              </Link>
            </DropdownMenuItem>
            {role === 'Owner' && (
              <DropdownMenuItem asChild>
                <Link
                  className="flex-center w-full flex-row"
                  href={'/dashboard'}>
                  <RiAdminLine
                    size={20}
                    className="mr-auto"
                  />
                  <span className="mr-auto">Dashboard</span>
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem asChild>
              <Link
                className="flex-center w-full flex-row"
                href={'/messages'}>
                <MessageSquare
                  size={20}
                  className="mr-auto"
                />
                <span className="mr-auto">Messages</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                className="flex-center w-full flex-row"
                href={'/settings'}>
                <RxGear
                  size={20}
                  className="mr-auto"
                />
                <span className="mr-auto">Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <SignOutButton />
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
};

export default NavbarUserDropdown;
