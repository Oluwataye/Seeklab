import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

interface BrandLogoProps {
  className?: string;
  variant?: 'default' | 'small' | 'large';
  showText?: boolean;
}

interface LogoSettings {
  imageUrl: string;
  name: string;
  tagline: string;
}

// Default logo settings in case API call fails
const defaultLogoSettings: LogoSettings = {
  imageUrl: '/logo.svg', // Fallback to a static logo file
  name: 'SeekLab',
  tagline: 'Medical Lab Results Management',
};

export function BrandLogo({ 
  className, 
  variant = 'default', 
  showText = true 
}: BrandLogoProps) {
  // Fetch logo settings from server
  const { data: logoSettings, isLoading } = useQuery<LogoSettings>({
    queryKey: ['/api/settings/logo'],
    // If the API fails, use default logo settings
    initialData: defaultLogoSettings,
    // Don't refetch too often
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Size mappings for different variants
  const sizes = {
    small: 'h-6 w-6',
    default: 'h-8 w-8',
    large: 'h-12 w-12',
  };

  const textSizes = {
    small: 'text-sm',
    default: 'text-base',
    large: 'text-xl',
  };

  // Render logo with loading state
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {isLoading ? (
        <Loader2 className={cn('animate-spin', sizes[variant])} />
      ) : (
        <img 
          src={logoSettings?.imageUrl || defaultLogoSettings.imageUrl} 
          alt={logoSettings?.name || defaultLogoSettings.name} 
          className={cn('rounded-sm', sizes[variant])} 
          onError={(e) => {
            // If the image fails to load, fall back to the default logo
            const target = e.target as HTMLImageElement;
            if (target.src !== defaultLogoSettings.imageUrl) {
              target.src = defaultLogoSettings.imageUrl;
            }
          }}
        />
      )}
      
      {showText && (
        <div className="flex flex-col">
          <span className={cn('font-bold', textSizes[variant])}>
            {logoSettings?.name || defaultLogoSettings.name}
          </span>
          {variant !== 'small' && (
            <span className="text-xs text-muted-foreground">
              {logoSettings?.tagline || defaultLogoSettings.tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
}