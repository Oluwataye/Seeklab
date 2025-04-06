import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  const [imageError, setImageError] = useState(false);
  const queryClient = useQueryClient();
  const [cacheBuster, setCacheBuster] = useState(Date.now()); // Add cache busting timestamp
  
  // Fetch logo settings from server with reduced caching
  const { data: logoSettings, isLoading } = useQuery<LogoSettings>({
    queryKey: ['/api/settings/logo', cacheBuster],
    // If the API fails, use default logo settings
    initialData: defaultLogoSettings,
    // Reduce caching time to make changes appear faster
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  // Re-fetch logo settings when component mounts to ensure we have the latest
  useEffect(() => {
    // Refresh the logo data when component mounts
    queryClient.invalidateQueries({ queryKey: ['/api/settings/logo'] });
    
    // Set up a refresh interval to update the cache buster
    const intervalId = setInterval(() => {
      setCacheBuster(Date.now());
    }, 60000); // Check for new logo every minute
    
    return () => clearInterval(intervalId);
  }, [queryClient]);

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

  // Generate a cache-busting URL for the image
  const imageUrl = imageError ? 
    defaultLogoSettings.imageUrl : 
    (logoSettings?.imageUrl ? `${logoSettings.imageUrl}?t=${cacheBuster}` : defaultLogoSettings.imageUrl);

  // Render logo with loading state
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {isLoading ? (
        <Loader2 className={cn('animate-spin', sizes[variant])} />
      ) : (
        <img 
          src={imageUrl} 
          alt={logoSettings?.name || defaultLogoSettings.name} 
          className={cn('rounded-sm', sizes[variant])} 
          onError={() => {
            // If the image fails to load, fall back to the default logo
            console.error(`Failed to load logo image from: ${imageUrl}`);
            if (!imageError) {
              setImageError(true);
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