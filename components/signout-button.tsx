'use client';

import React from 'react';
import useAction from '@/components/hooks/useAction';
import { LogOut } from 'lucide-react';
import { DropdownMenuItem } from './dropdown-menu';
import { signOut } from './actions/actions';

const SignOutButton: React.FC = () => {
  const { execute, loading } = useAction(signOut);

  return (
    <DropdownMenuItem asChild>
      <button
        type="button"
        className="flex-center w-full flex-row"
        onClick={() => execute()}>
        <LogOut
          size={20}
          className="text-destructive mr-auto"
        />
        <span className="text-destructive mr-auto">Sign Out</span>
      </button>
    </DropdownMenuItem>
  );
};

export default SignOutButton;
