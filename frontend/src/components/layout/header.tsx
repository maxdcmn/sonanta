'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-provider';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

function ListItem({
  title,
  children,
  href,
  disabled = false,
  ...props
}: React.ComponentPropsWithoutRef<'li'> & { href: string; disabled?: boolean }) {
  if (disabled) {
    return (
      <li {...props}>
        <div aria-disabled="true" className="cursor-not-allowed rounded-md p-2 opacity-50">
          <div className="flex items-center gap-2">
            <div className="text-sm leading-none font-medium">{title}</div>
            <span className="text-muted-foreground text-[10px] tracking-wide uppercase">Soon</span>
          </div>
          <p className="text-muted-foreground line-clamp-2 text-sm">{children}</p>
        </div>
      </li>
    );
  }

  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <a href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  );
}

function useNavbarVisibility({
  delta = 50,
  topThreshold = 30,
}: {
  delta?: number;
  topThreshold?: number;
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [hovering, setHovering] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      if (hovering) return;
      if (Math.abs(y - lastY.current) < delta) return;
      if (y <= topThreshold) {
        setIsVisible(true);
      } else {
        setIsVisible(y < lastY.current);
      }
      lastY.current = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hovering, delta, topThreshold]);

  return {
    isVisible,
    hovering,
    onMouseEnter: () => setHovering(true),
    onMouseLeave: () => setHovering(false),
  };
}

export function Header() {
  const { isLoggedIn } = useAuth();
  const { isVisible, hovering, onMouseEnter, onMouseLeave } = useNavbarVisibility({});
  const [voiceMenuOpen, setVoiceMenuOpen] = useState(false);
  const [dashboardMenuOpen, setDashboardMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setVoiceMenuOpen(false);
      setDashboardMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const headerClass = clsx(
    'fixed top-0 z-50 w-full p-6 transition-transform duration-300 ease-in-out',
    {
      '-translate-y-full': !isVisible && !hovering,
    },
  );

  return (
    <header
      role="navigation"
      className={headerClass}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="mx-auto max-w-6xl">
        <div className="bg-background/60 rounded-lg border-0 backdrop-blur-sm">
          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex items-center">
              <NavigationMenu viewport={false} className="hidden md:block">
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent">Voice</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[500px] grid-cols-[.5fr_1fr] gap-x-2">
                        <li className="row-span-5">
                          <NavigationMenuLink asChild>
                            <Link
                              className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-gradient-to-b p-4 no-underline outline-hidden select-none focus:shadow-md"
                              href="/"
                            >
                              <div className="font-mono text-lg -tracking-wider">sonanta</div>
                              <p className="text-muted-foreground text-sm leading-tight">
                                Navigate thoughts
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        <ListItem href="/voice/notes" title="Notes">
                          Record and review your voice messages
                        </ListItem>
                        <ListItem href="/voice/talk" title="Talk">
                          Start a voice conversation
                        </ListItem>
                        <ListItem href="/how-it-works" title="How it works" disabled>
                          A quick guide to using the app.
                        </ListItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent">
                      Dashboard
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[300px]">
                        <ListItem href="/dashboard/account" title="Account">
                          View your account settings
                        </ListItem>
                        <ListItem href="/dashboard/billing" title="Billing">
                          Manage your subscription and payments
                        </ListItem>
                        <ListItem href="/dashboard/usage" title="Usage">
                          Monitor your API usage and analytics
                        </ListItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>

              <div className="flex space-x-2 md:hidden">
                <DropdownMenu open={voiceMenuOpen} onOpenChange={setVoiceMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      Voice
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-40">
                    <DropdownMenuItem asChild>
                      <Link href="/">Sonanta</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/voice/notes">Notes</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/voice/talk">Talk</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <span className="flex w-full cursor-not-allowed items-center justify-between opacity-60">
                        <span>How it works</span>
                        <span className="text-muted-foreground text-[10px] tracking-wide uppercase">
                          Soon
                        </span>
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu open={dashboardMenuOpen} onOpenChange={setDashboardMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      Dashboard
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-40">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/account">Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/billing">Billing</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/usage">Usage</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {isLoggedIn ? (
                <Button variant="ghost" onClick={handleSignOut}>
                  Sign Out
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
