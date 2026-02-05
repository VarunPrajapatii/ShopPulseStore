"use client"

import { useEffect, useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import useCart from '@/hooks/use-cart'
import { useRouter } from 'next/navigation'
import OrderSearch from '@/components/order-search'
import { cn } from '@/lib/utils'

const NavbarAction = () => {
  // we add mount because we want to use cart and store items in the local storage so that can cause hydration error
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const router = useRouter();
  const cart = useCart();

  if (!isMounted) {
    return (
      <div className='flex items-center gap-x-3'>
        {/* Skeleton for search */}
        <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        {/* Skeleton for cart */}
        <div className="w-[72px] h-9 rounded-full bg-muted animate-pulse" />
      </div>
    )
  }

  return (
    <div className='flex items-center gap-x-3'>
      <OrderSearch />
      <button 
        onClick={() => router.push('/cart')} 
        className={cn(
          'group relative flex items-center gap-x-2 rounded-full px-4 py-2 transition-all duration-300 border',
          cart.items.length > 0
            ? 'bg-foreground border-foreground hover:bg-foreground/90'
            : 'bg-foreground/5 border-border/50 hover:bg-foreground/10 hover:border-border'
        )}
      >
        <ShoppingBag
          size={18}
          strokeWidth={1.5}
          className={cn(
            'transition-transform duration-300 group-hover:scale-110',
            cart.items.length > 0 ? 'text-background' : 'text-foreground'
          )}
        />
        <span className={cn(
          'text-sm font-medium tabular-nums',
          cart.items.length > 0 ? 'text-background' : 'text-foreground'
        )}>
          {cart.items.length}
        </span>
      </button>
    </div>
  )
}

export default NavbarAction