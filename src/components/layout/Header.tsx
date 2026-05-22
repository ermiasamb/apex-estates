'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/Logo';
import { Building2, Heart, Menu, User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '@/providers/auth-provider';
import { Skeleton } from '../ui/skeleton';

const navLinks = [
  { href: '/search', label: 'Search' },
  { href: '/search?type=sale', label: 'Buy' },
  { href: '/search?type=rent', label: 'Rent' },
  { href: '/brokers', label: 'Find Agents' },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();

  const UserMenu = () => {
    if (loading) {
      return <Skeleton className="h-10 w-24 rounded-md" />;
    }

    if (!user) {
      return (
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Sign Up</Link>
          </Button>
        </div>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar>
              <AvatarImage src={`https://i.pravatar.cc/150?u=${user.email}`} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile"><User className="mr-2 h-4 w-4" />Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/favorites"><Heart className="mr-2 h-4 w-4" />Favorites</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/my-properties"><Building2 className="mr-2 h-4 w-4" />My Properties</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
            <span className="hidden font-bold sm:inline-block font-headline text-lg">
              Apex Estates
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'transition-colors hover:text-primary',
                  pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Header */}
        <div className="flex w-full items-center justify-between md:hidden">
          <Link href="/" className="flex items-center space-x-2">
            <Logo />
            <span className="font-bold font-headline text-lg">Apex Estates</span>
          </Link>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col">
              <div className="flex items-center justify-between border-b pb-4">
                <Link href="/" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <Logo />
                  <span className="font-bold font-headline text-lg">Apex Estates</span>
                </Link>
              </div>
              <nav className="flex-1 flex flex-col gap-4 py-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-lg font-medium text-foreground hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2">
                <Button asChild className='w-full' size="lg" onClick={() => setIsMobileMenuOpen(false)}>
                  <Link href="/add-listing">List your property</Link>
                </Button>
                {user ? (
                  <div className="grid grid-cols-1 gap-2">
                    <Button asChild className='w-full' size="lg" variant="outline" onClick={() => setIsMobileMenuOpen(false)}>
                      <Link href="/my-properties">My Properties</Link>
                    </Button>
                    <Button asChild className='w-full' size="lg" variant="outline" onClick={() => setIsMobileMenuOpen(false)}>
                      <Link href="/profile">My Profile</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button asChild variant="outline" onClick={() => setIsMobileMenuOpen(false)}><Link href="/login">Log In</Link></Button>
                    <Button asChild onClick={() => setIsMobileMenuOpen(false)}><Link href="/register">Sign Up</Link></Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button asChild className="hidden md:inline-flex rounded-full" variant="outline">
            <Link href="/add-listing">List your property</Link>
          </Button>
          {user && (
            <Button asChild variant="ghost" size="icon">
              <Link href="/favorites">
                <Heart className="h-5 w-5" />
                <span className="sr-only">Favorites</span>
              </Link>
            </Button>
          )}
          <div className="hidden md:flex">
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
