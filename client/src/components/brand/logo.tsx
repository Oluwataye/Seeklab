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
  tagline: 'Substance Abuse Screening Test',
};

// Use localStorage to persistently cache the logo settings between page refreshes
const getStoredLogoUrl = (): string | null => {
  try {
    // Try to get from localStorage first
    const storedUrl = localStorage.getItem('lastValidLogoUrl');
    if (storedUrl) {
      return storedUrl;
    }
    
    // If not in localStorage, try to load from backup file
    // This is just a static path reference, not an API call
    return '/uploads/logo-backup.json'; 
  } catch (e) {
    console.error('Error retrieving cached logo URL', e);
    return null;
  }
};

const storeLogoUrl = (url: string | null): void => {
  try {
    if (url) {
      // Store in localStorage for fast access
      localStorage.setItem('lastValidLogoUrl', url);
      
      // Also store timestamp of last successful logo
      localStorage.setItem('lastValidLogoTimestamp', Date.now().toString());
    }
  } catch (e) {
    console.error('Failed to store logo URL in localStorage', e);
  }
};

// Utility function to try loading an image and check if it exists
const checkImageExists = async (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

export function BrandLogo({ 
  className, 
  variant = 'default',
  showText = true,
  logoType = 'normal'
}: BrandLogoProps) {
  // Local state for image error tracking
  const [imageError, setImageError] = useState(false);
  
  // Initialize lastValidImageUrl from localStorage for persistence between refreshes
  const [lastValidImageUrl, setLastValidImageUrl] = useState<string | null>(getStoredLogoUrl());
  
  const queryClient = useQueryClient();
  // Use a stable cacheBuster that doesn't change on re-renders
  const [cacheBuster] = useState(() => Date.now());
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Fetch logo settings once on component mount, with force refresh
  useEffect(() => {
    // Force clear both the query cache and local storage
    localStorage.removeItem('lastValidLogoTimestamp');
    queryClient.removeQueries({ queryKey: ['/api/settings/logo'] });
    queryClient.invalidateQueries({ queryKey: ['/api/settings/logo'] });
  }, [queryClient]);
  
  // Fetch logo settings from server with minimal caching to get fresh data
  const { data: logoSettings, isLoading } = useQuery<LogoSettings>({
    queryKey: ['/api/settings/logo', cacheBuster],
    initialData: defaultLogoSettings,
    staleTime: 0, // No caching - always get fresh data
    refetchOnWindowFocus: true, // Refresh when window gets focus
    refetchOnMount: true,
    retry: 3,
    // Force a success response type
    select: (data): LogoSettings => {
      // Ensure we have valid data structure
      return {
        imageUrl: data?.imageUrl || '',
        name: data?.name || defaultLogoSettings.name,
        tagline: data?.tagline || defaultLogoSettings.tagline
      };
    }
  });

  // Update local state AND localStorage when we get valid logo data
  useEffect(() => {
    if (logoSettings?.imageUrl && logoSettings.imageUrl !== '') {
      setLastValidImageUrl(logoSettings.imageUrl);
      storeLogoUrl(logoSettings.imageUrl);
      setImageError(false);
    }
  }, [logoSettings]);

  // Image URL precedence:
  // 1. Current API response if valid
  // 2. Locally stored valid URL if not in error state
  // 3. From localStorage cache
  const effectiveImageUrl = imageError ? null : (
    (logoSettings?.imageUrl && logoSettings.imageUrl !== '') 
      ? logoSettings.imageUrl 
      : lastValidImageUrl
  );
  
  // Generate a cache-busted URL for the image that remains stable during this session
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
    // Generate a new unique timestamp for this refresh
    const newCacheBuster = Date.now();
    // Construct a fresh URL for a true force refresh
    const refreshUrl = effectiveImageUrl 
      ? `${effectiveImageUrl}?force=true&t=${newCacheBuster}`
      : '';
      
    // Try to preload the image to verify it exists
    if (refreshUrl) {
      const img = new Image();
      img.onload = () => {
        // Success - reset the error state
        setImageError(false);
        // Force a re-fetch from server
        queryClient.invalidateQueries({ queryKey: ['/api/settings/logo'] });
      };
      img.onerror = () => {
        console.error('Force refresh failed to load logo');
        // Keep the error state
        setImageError(true);
      };
      img.src = refreshUrl;
    } else {
      // No URL to try, just re-fetch from server
      queryClient.invalidateQueries({ queryKey: ['/api/settings/logo'] });
    }
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