import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, AlertCircle } from 'lucide-react';

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
  imageUrl: '', // Empty fallback - we'll handle this with a placeholder
  name: 'SeekLab',
  tagline: 'Medical Lab Results Management',
};

export function BrandLogo({ 
  className, 
  variant = 'default',
  showText = true,
  logoType = 'normal'
}: BrandLogoProps) {
  const [imageError, setImageError] = useState(false);
  const queryClient = useQueryClient();
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const imgRef = useRef<HTMLImageElement>(null);

  // Fetch logo settings from server with minimal caching
  const { data: logoSettings, isLoading } = useQuery<LogoSettings>({
    queryKey: ['/api/settings/logo', cacheBuster],
    initialData: defaultLogoSettings,
    staleTime: 1000 * 10, // 10 seconds - more aggressive caching
    refetchInterval: 30000, // Re-fetch every 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  // Force refresh logo settings and reset error state
  const refreshLogo = () => {
    setImageError(false);
    setCacheBuster(Date.now());
    queryClient.invalidateQueries({ queryKey: ['/api/settings/logo'] });
  };

  // Re-fetch logo settings when component mounts
  useEffect(() => {
    refreshLogo();
    
    // Set up a refresh interval 
    const intervalId = setInterval(refreshLogo, 30000);
    
    return () => clearInterval(intervalId);
  }, [queryClient]);

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

  // Generate a heavily cache-busted URL for the image
  const imageUrl = logoSettings?.imageUrl 
    ? `${logoSettings.imageUrl}?t=${cacheBuster}&v=${encodeURIComponent(variant)}&type=${logoType}`
    : '';

  // Create placeholder when no image or error
  const PlaceholderLogo = () => (
    <div 
      className={cn(
        'flex items-center justify-center bg-gray-200 rounded-sm text-gray-600',
        sizes[variant]
      )}
    >
      <span className="font-bold text-xs">
        {logoSettings?.name?.substring(0, 2) || 'SL'}
      </span>
    </div>
  );

  // Render logo with loading state
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {isLoading ? (
        <Loader2 className={cn('animate-spin', sizes[variant])} />
      ) : imageError || !imageUrl ? (
        <PlaceholderLogo />
      ) : (
        <img 
          ref={imgRef}
          src={imageUrl} 
          alt={logoSettings?.name || defaultLogoSettings.name} 
          className={cn('rounded-sm object-contain', sizes[variant])} 
          onError={(e) => {
            console.error(`Failed to load ${logoType} logo from ${imageUrl}`);
            setImageError(true);
          }}
          onLoad={() => {
            // Reset error state if image loads successfully
            if (imageError) {
              setImageError(false);
            }
          }}
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