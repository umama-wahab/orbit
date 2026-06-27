import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const MobileNavContext = createContext(null);

export function MobileNavProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Auto-close the drawer whenever the route changes (tap a nav item -> navigate -> close).
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <MobileNavContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false), toggle: () => setIsOpen((v) => !v) }}>
      {children}
    </MobileNavContext.Provider>
  );
}

export function useMobileNav() {
  const ctx = useContext(MobileNavContext);
  if (!ctx) throw new Error("useMobileNav must be used within MobileNavProvider");
  return ctx;
}
