import type { ReactNode } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
export default function PageShell({children}:{children:ReactNode}) {
  return <><Navbar/><main className="min-h-screen pt-24">{children}</main><Footer/></>;
}
