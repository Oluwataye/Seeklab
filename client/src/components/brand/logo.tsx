import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Image as ImageIcon } from 'lucide-react';

interface BrandLogoProps {
  className?: string;
  variant?: 'default' | 'small' | 'large' | 'icon';
  showText?: boolean;
  logoType?: 'normal' | 'preview';
}

interface LogoSettings {
  imageUrl: string;
  name: string;
  tagline: string;
}

// Default logo settings in case API call fails
const defaultLogoSettings: LogoSettings = {
  imageUrl: '',
  name: 'SeekLab',
  tagline: 'Medical Lab Results Management',
};

export function BrandLogo({ 
  className, 
  variant = 'default',
  showText = true,
  logoType = 'normal'
}: BrandLogoProps) {
  // Local state for image error tracking
  const [imageError, setImageError] = useState(false);
  // Local state for persisting the last valid URL
  const [lastValidImageUrl, setLastValidImageUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Disable auto-refresh to prevent image flashing
  useEffect(() => {
    // Initial fetch only - no interval to avoid flickering
    queryClient.invalidateQueries({ queryKey: ['/api/settings/logo'] });
    
    // Only refresh cache buster on mount
    setCacheBuster(Date.now());
  }, [queryClient]);
  
  // Fetch logo settings from server with proper caching
  const { data: logoSettings, isLoading } = useQuery<LogoSettings>({
    queryKey: ['/api/settings/logo', cacheBuster],
    initialData: defaultLogoSettings,
    staleTime: 1000 * 60, // 1 minute - stable caching
    refetchOnWindowFocus: false, // Don't auto-refresh to prevent flashing
    refetchOnMount: true,
    retry: 3,
  });
  
  // Handle successful data fetches
  useEffect(() => {
    if (logoSettings?.imageUrl && logoSettings.imageUrl !== '') {
      setLastValidImageUrl(logoSettings.imageUrl);
      setImageError(false);
    }
  }, [logoSettings]);

  // Use the most stable URL source - either from API or from our local state
  const effectiveImageUrl = imageError ? null : (
    logoSettings?.imageUrl && logoSettings.imageUrl !== '' 
      ? logoSettings.imageUrl 
      : lastValidImageUrl
  );
  
  // Generate a cache-busted URL for the image
  const displayUrl = effectiveImageUrl 
    ? `${effectiveImageUrl}?t=${cacheBuster}&v=${encodeURIComponent(variant)}&type=${logoType}`
    : '';

  // Size mappings for different variants
  const sizes = {
    small: 'h-6 w-6',
    default: 'h-8 w-8',
    large: 'h-12 w-12',
    icon: 'h-10 w-10',
  };

  const textSizes = {
    small: 'text-sm',
    default: 'text-base',
    large: 'text-xl',
    icon: 'text-lg',
  };

  // Create placeholder when no image or error
  const PlaceholderLogo = () => (
    <div 
      className={cn(
        'flex items-center justify-center bg-gray-100 border border-gray-200 rounded-sm text-primary',
        sizes[variant]
      )}
    >
      <ImageIcon className="w-4 h-4" />
    </div>
  );

  // Create a function to manually refresh the logo if needed
  const forceRefresh = () => {
    setImageError(false);
    setCacheBuster(Date.now());
    queryClient.invalidateQueries({ queryKey: ['/api/settings/logo'] });
  };

  // Render logo with loading state
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {isLoading ? (
        <Loader2 className={cn('animate-spin', sizes[variant])} />
      ) : !displayUrl ? (
        <PlaceholderLogo />
      ) : (
        <img 
          ref={imgRef}
          src={displayUrl} 
          alt={logoSettings?.name || defaultLogoSettings.name} 
          className={cn('rounded-sm object-contain', sizes[variant])} 
          onError={() => {
            console.error(`Failed to load ${logoType} logo from ${displayUrl}`);
            setImageError(true);
          }}
          onClick={forceRefresh} // Allow manual refresh on click
          style={{ cursor: 'pointer' }}
        />
      )}
      
      {showText && (
        <div className="flex flex-col">
          <span className={cn('font-bold', textSizes[variant])}>
            {logoSettings?.name || defaultLogoSettings.name}
          </span>
          {variant !== 'small' && variant !== 'icon' && (
            <span className="text-xs text-muted-foreground">
              {logoSettings?.tagline || defaultLogoSettings.tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
}