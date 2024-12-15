'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import React from 'react';
import { PiMonitor } from 'react-icons/pi';

export default function ThemeDropdown() {
  const { theme, setTheme } = useTheme();

  const menuItems = [
    {
      icon: (
        <Sun
          size={20}
          className="mr-auto"
        />
      ),
      text: 'Light',
    },
    {
      icon: (
        <Moon
          size={20}
          className="mr-auto"
        />
      ),
      text: 'Dark',
    },
    {
      icon: (
        <PiMonitor
          size={20}
          className="mr-auto"
        />
      ),
      text: 'System',
    },
  ];

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger>
        <div className="flex-center border-accent text-accent hover:bg-secondary h-10 w-10 cursor-pointer flex-row gap-1 rounded-md border text-[1.2rem] transition-all duration-300">
          <Sun
            size={28}
            className="dark:hidden"
          />
          <Moon
            size={24}
            className="hidden dark:block"
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            {item.text === 'System' && <DropdownMenuSeparator />}
            <DropdownMenuItem className="w-full">
              <button
                className="flex-center text-text dark:text-dark_text w-full flex-row"
                onClick={() => setTheme(item.text.toLowerCase())}>
                {item.icon}
                <span className="mr-auto">{item.text}</span>
              </button>
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
