'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Building2,
  Heart,
  LogOut,
  Menu,
  Search,
  User,
  ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { useAuth } from '@/providers/auth-provider';
import { cn } from '@/lib/utils';

const navLinks = [
  {
    href: '/search',
    label: 'Search',
    description: 'Explore homes',
  },
  {
    href: '/search?type=sale',
    label: 'Buy',
    description: 'Homes for sale',
    type: 'sale',
  },
  {
    href: '/search?type=rent',
    label: 'Rent',
    description: 'Rental homes',
    type: 'rent',
  },
  {
    href: '/brokers',
    label: 'Agents',
    description: 'Find experts',
  },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = searchParams.get('type');

  const { user, logout, loading } = useAuth();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const isActiveLink = (link: (typeof navLinks)[number]) => {
    if (link.type) {
      return pathname === '/search' && currentType === link.type;
    }

    if (link.href === '/search') {
      return pathname === '/search' && !currentType;
    }

    return pathname === link.href;
  };

  const UserMenu = () => {
    if (loading) {
      return <Skeleton className="h-12 w-24 rounded-full" />;
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'group flex h-12 items-center gap-3 rounded-full border bg-white px-2 pl-4 shadow-sm',
              'transition-all duration-300 ease-out',
              'hover:-translate-y-0.5 hover:shadow-lg',
              'data-[state=open]:scale-95 data-[state=open]:shadow-lg'
            )}
          >
            <Menu className="h-5 w-5 text-neutral-700 transition-transform duration-300 group-hover:scale-110" />

            {user ? (
              <Avatar className="h-8 w-8 border">
                <AvatarImage
                  src={`https://i.pravatar.cc/150?u=${user.email}`}
                  alt={user.name}
                />
                <AvatarFallback>
                  {user.name?.charAt(0).toUpperCase() ?? 'U'}
                </AvatarFallback>
              </Avatar>
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100">
                <User className="h-4 w-4 text-neutral-600" />
              </span>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={12}
          className={cn(
            'w-72 rounded-3xl border bg-white p-3 shadow-2xl',
            'origin-top-right transition-all duration-200',
            'data-[state=open]:scale-100 data-[state=open]:opacity-100',
            'data-[state=closed]:scale-95 data-[state=closed]:opacity-0'
          )}
        >
          {user ? (
            <>
              <DropdownMenuLabel className="rounded-2xl px-3 py-3 font-normal">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 border">
                    <AvatarImage
                      src={`https://i.pravatar.cc/150?u=${user.email}`}
                      alt={user.name}
                    />
                    <AvatarFallback>
                      {user.name?.charAt(0).toUpperCase() ?? 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-neutral-950">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-neutral-500">
                      {user.email}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild className="cursor-pointer rounded-2xl px-3 py-3">
                <Link href="/profile">
                  <User className="mr-3 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="cursor-pointer rounded-2xl px-3 py-3">
                <Link href="/favorites">
                  <Heart className="mr-3 h-4 w-4" />
                  Favorites
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="cursor-pointer rounded-2xl px-3 py-3">
                <Link href="/my-properties">
                  <Building2 className="mr-3 h-4 w-4" />
                  My Properties
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer rounded-2xl px-3 py-3 text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem asChild className="cursor-pointer rounded-2xl px-3 py-3 font-semibold">
                <Link href="/login">Log in</Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="cursor-pointer rounded-2xl px-3 py-3">
                <Link href="/register">Sign up</Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild className="cursor-pointer rounded-2xl px-3 py-3">
                <Link href="/add-listing">List your property</Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left Logo */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2 transition-transform duration-300 hover:scale-[1.03]"
        >
          <Image 
            src="/logo.png" 
            alt="Dan Besh" 
            width={32} 
            height={32}
            className="h-8 w-8"
          />
          <span className="hidden font-headline text-lg font-bold text-neutral-950 sm:inline-block">
            Dan Besh
          </span>
        </Link>

        {/* Desktop Airbnb-style center menu */}
        <nav className="hidden flex-1 justify-center lg:flex">
          <div
            className={cn(
              'flex h-14 items-center rounded-full border bg-white shadow-md',
              'transition-all duration-300 ease-out',
              'hover:-translate-y-0.5 hover:shadow-xl'
            )}
          >
            {navLinks.map((link, index) => {
              const active = isActiveLink(link);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'group relative flex h-full min-w-[105px] flex-col justify-center rounded-full px-5 transition-all duration-300',
                    'hover:bg-neutral-100',
                    active && 'bg-neutral-950 text-white hover:bg-neutral-950'
                  )}
                >
                  <span
                    className={cn(
                      'text-sm font-semibold leading-none transition-colors',
                      active ? 'text-white' : 'text-neutral-900'
                    )}
                  >
                    {link.label}
                  </span>

                  <span
                    className={cn(
                      'mt-1 text-xs leading-none transition-colors',
                      active
                        ? 'text-white/70'
                        : 'text-neutral-500 group-hover:text-neutral-700'
                    )}
                  >
                    {link.description}
                  </span>

                  {index !== navLinks.length - 1 && !active && (
                    <span className="absolute right-0 top-1/2 h-6 w-px -translate-y-1/2 bg-neutral-200 group-hover:opacity-0" />
                  )}
                </Link>
              );
            })}

            <Link
              href="/search"
              className={cn(
                'mr-2 flex h-11 w-11 items-center justify-center rounded-full',
                'bg-[#ff385c] text-white shadow-sm',
                'transition-all duration-300 ease-out',
                'hover:scale-110 hover:bg-[#e31c5f] hover:shadow-lg',
                'active:scale-95'
              )}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Link>
          </div>
        </nav>

        {/* Desktop right side */}
        <div className="hidden shrink-0 items-center gap-3 md:flex">
          <Button
            asChild
            variant="ghost"
            className={cn(
              'rounded-full px-5 font-semibold text-neutral-800',
              'transition-all duration-300',
              'hover:-translate-y-0.5 hover:bg-neutral-100'
            )}
          >
            <Link href="/add-listing">List your property</Link>
          </Button>

          {user && (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-100"
            >
              <Link href="/favorites">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Favorites</span>
              </Link>
            </Button>
          )}

          <UserMenu />
        </div>

        {/* Mobile trigger */}
        <div className="flex items-center md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                className={cn(
                  'flex h-12 items-center gap-2 rounded-full border bg-white px-4 shadow-sm',
                  'transition-all duration-300',
                  'hover:shadow-lg active:scale-95'
                )}
              >
                <Menu className="h-5 w-5" />
                <span className="text-sm font-semibold">Menu</span>
              </button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="flex w-[330px] flex-col border-l bg-white p-0 sm:w-[420px]"
            >
              <div className="border-b px-6 py-5">
                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-2"
                >
                  <Image 
                    src="/logo.png" 
                    alt="Dan Besh" 
                    width={32} 
                    height={32}
                    className="h-8 w-8"
                  />
                  <span className="font-headline text-lg font-bold">
                    Dan Besh
                  </span>
                </Link>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-6">
                <nav className="space-y-3">
                  {navLinks.map((link, index) => {
                    const active = isActiveLink(link);

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={closeMobileMenu}
                        className={cn(
                          'group flex items-center justify-between rounded-3xl border px-5 py-4',
                          'transition-all duration-300 ease-out',
                          'hover:translate-x-1 hover:shadow-md',
                          active
                            ? 'border-neutral-950 bg-neutral-950 text-white'
                            : 'border-neutral-200 bg-white text-neutral-950 hover:bg-neutral-50'
                        )}
                        style={{
                          transitionDelay: `${index * 40}ms`,
                        }}
                      >
                        <div>
                          <p className="font-semibold">{link.label}</p>
                          <p
                            className={cn(
                              'mt-1 text-sm',
                              active ? 'text-white/70' : 'text-neutral-500'
                            )}
                          >
                            {link.description}
                          </p>
                        </div>

                        <ChevronRight
                          className={cn(
                            'h-5 w-5 transition-transform duration-300 group-hover:translate-x-1',
                            active ? 'text-white' : 'text-neutral-400'
                          )}
                        />
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-7 rounded-[2rem] bg-neutral-950 p-5 text-white shadow-lg">
                  <p className="text-lg font-bold">List your property</p>
                  <p className="mt-2 text-sm text-white/70">
                    Reach buyers and renters faster with Dan Besh.
                  </p>

                  <Button
                    asChild
                    className="mt-5 w-full rounded-full bg-[#ff385c] text-white hover:bg-[#e31c5f]"
                    size="lg"
                    onClick={closeMobileMenu}
                  >
                    <Link href="/add-listing">Get started</Link>
                  </Button>
                </div>
              </div>

              <div className="border-t p-5">
                {loading ? (
                  <Skeleton className="h-12 w-full rounded-full" />
                ) : user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-3xl bg-neutral-100 p-3">
                      <Avatar className="h-11 w-11 border">
                        <AvatarImage
                          src={`https://i.pravatar.cc/150?u=${user.email}`}
                          alt={user.name}
                        />
                        <AvatarFallback>
                          {user.name?.charAt(0).toUpperCase() ?? 'U'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-neutral-500">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        asChild
                        variant="outline"
                        className="rounded-full"
                        onClick={closeMobileMenu}
                      >
                        <Link href="/profile">Profile</Link>
                      </Button>

                      <Button
                        asChild
                        variant="outline"
                        className="rounded-full"
                        onClick={closeMobileMenu}
                      >
                        <Link href="/my-properties">Properties</Link>
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      className="w-full rounded-full text-red-600 hover:text-red-600"
                      onClick={() => {
                        closeMobileMenu();
                        logout();
                      }}
                    >
                      Log out
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-full"
                      onClick={closeMobileMenu}
                    >
                      <Link href="/login">Log In</Link>
                    </Button>

                    <Button
                      asChild
                      className="rounded-full bg-[#ff385c] text-white hover:bg-[#e31c5f]"
                      onClick={closeMobileMenu}
                    >
                      <Link href="/register">Sign Up</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Tablet nav, shown between md and lg */}
      <div className="hidden border-t bg-white px-4 py-3 md:block lg:hidden">
        <nav className="mx-auto flex max-w-3xl items-center justify-center rounded-full border bg-white p-1 shadow-sm">
          {navLinks.map((link) => {
            const active = isActiveLink(link);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold transition-all duration-300',
                  active
                    ? 'bg-neutral-950 text-white shadow-sm'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}