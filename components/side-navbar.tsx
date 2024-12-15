'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { LogIn, Menu } from 'lucide-react';
import { LogOut } from 'lucide-react';
import { useSession } from './providers/SessionProvider';
import { PiFastForwardCircleBold } from 'react-icons/pi';
import useAction from './hooks/useAction';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from './sheet';
import { signOut } from './actions/actions';

export function SideNavbar() {
  const { execute, loading } = useAction(signOut);
  const { user } = useSession();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={setIsOpen}>
      <SheetTrigger>
        <div className="flex-center border-accent text-accent hover:bg-secondary ml-2 block h-10 w-10 cursor-pointer flex-row gap-1 rounded-md border text-[1.2rem] transition-all duration-300 xl:hidden">
          <Menu
            size={35}
            strokeWidth={1.2}
          />
        </div>
      </SheetTrigger>
      <SheetContent className="flex flex-col gap-2">
        <SheetHeader>
          <SheetTitle></SheetTitle>
          <SheetDescription></SheetDescription>
          {[{ name: '00', href: '00', icon: PiFastForwardCircleBold }].map(({ name, href, icon: Icon }) => (
            <Link
              key={name}
              className="flex-center bg-secondary rounded-sm duration-300 transition-all h-10 text-sm font-bold text-dark_text w-full hover:bg-secondary/80"
              href={href}>
              <Icon className="h-5 w-5 mr-auto ml-2" />
              <p className="mr-auto">{name.toUpperCase()}</p>
            </Link>
          ))}
        </SheetHeader>
        <SheetFooter className="mt-auto">
          {!user ? (
            <Link
              className="bg-primary flex-center rounded-sm duration-300 transition-all h-10 text-sm font-bold text-dark_text w-full hover:bg-primary/80"
              href={'/signin'}
              onClick={() => setIsOpen(false)}>
              <LogIn className="h-5 w-5 mr-auto ml-2" />
              <p className="mr-auto"> SIGN IN</p>
            </Link>
          ) : (
            <button
              className="bg-destructive flex-center rounded-sm duration-300 transition-all h-10 text-sm font-bold text-dark_text w-full hover:bg-destructive/80"
              onClick={() => {
                execute();
                setIsOpen(false);
              }}>
              <LogOut className="h-5 w-5 mr-auto ml-2" />
              <p className="mr-auto">SIGN OUT</p>
            </button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default SideNavbar;
