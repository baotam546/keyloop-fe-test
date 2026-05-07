import { NavLink } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from './ui/avatar';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-6">
        <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
          <Wrench className="size-4" />
          <span>ServiceDesk</span>
        </div>
        <nav className="flex items-center gap-1 flex-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cn('px-3 py-1.5 text-sm rounded-md font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/60')
            }
          >
            Book Service
          </NavLink>
          <NavLink
            to="/appointments"
            className={({ isActive }) =>
              cn('px-3 py-1.5 text-sm rounded-md font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/60')
            }
          >
            My Appointments
          </NavLink>
        </nav>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Avatar size="sm">
            <AvatarFallback>G</AvatarFallback>
          </Avatar>
          <span className="hidden sm:block">Guest</span>
        </div>
      </div>
    </header>
  );
}
