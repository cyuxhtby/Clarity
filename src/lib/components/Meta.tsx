'use client'

import { useEffect, useState } from 'react';

const APP_NAME = 'nextarter-chakra';

const Meta = () => {
  const [themeColor, setThemeColor] = useState('#0F4C81'); 

  useEffect(() => {
    const setTheme = (e: any) => {
      setThemeColor(e.matches ? '#0F4C81' : '#FFFFFF'); 
    };

    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addListener(setTheme);
    setTheme(darkModeMediaQuery);

    return () => {
      darkModeMediaQuery.removeListener(setTheme);
    };
  }, []);
  return (
    <>
      <meta name="application-name" content={APP_NAME} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={APP_NAME} />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="theme-color" content="#FFFFFF" />

      <link rel="shortcut icon" href="/favicon.ico" />
      <link rel="icon" href="/icons/clarity_512.png" />
      <link rel="apple-touch-icon" href="/icons/clarity_512.png" />
      <link rel="icon" href="/icons/clarity_192.png" />
      <link rel="apple-touch-icon" href="/icons/clarity_192.png" />
      <link rel="manifest" href="/manifest.json" />
    </>
  );
};

export default Meta;
