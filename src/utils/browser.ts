export const isInAppBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const ua = window.navigator.userAgent;
  return (
    ua.includes('FBAN') || // Facebook
    ua.includes('FBAV') || // Facebook
    ua.includes('Twitter') || // Twitter
    ua.includes('Instagram') || // Instagram
    ua.includes('Line') || // Line
    ua.includes('KAKAOTALK') // KakaoTalk
  );
};

export const isSafariBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const ua = window.navigator.userAgent;
  return ua.includes('Safari') && !ua.includes('Chrome');
};

export const validateDomain = (authorizedDomains: string[]): boolean => {
  if (typeof window === 'undefined') return true;
  
  const currentDomain = window.location.hostname;
  return authorizedDomains.some(domain => 
    currentDomain === domain || 
    currentDomain.endsWith(`.${domain}`)
  );
}; 