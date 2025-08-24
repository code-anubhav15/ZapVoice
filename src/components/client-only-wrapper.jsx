'use client';

import { useState, useEffect } from 'react';

export default function ClientOnly({ children }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null; // Or you can return a loading spinner or a skeleton component
  }

  return <>{children}</>;
}