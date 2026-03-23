import { ReactNode, Suspense, Children } from 'react';

import { getThemeBlock } from '@/core/theme';
import {
  Footer as FooterType,
  Header as HeaderType,
} from '@/shared/types/blocks/landing';

export default async function LandingLayout({
  children,
  header,
  footer,
}: {
  children: ReactNode;
  header: HeaderType;
  footer: FooterType;
}) {
  // Check if we're rendering the custom homepage
  // The custom homepage is rendered when the component has isCustomHomepage prop
  let isCustomHomepage = false;
  Children.forEach(children, (child) => {
    if ((child as any)?.props?.isCustomHomepage === true) {
      isCustomHomepage = true;
    }
  });

  const Header = await getThemeBlock('header');
  const Footer = await getThemeBlock('footer');

  return (
    <div className="h-screen w-screen">
      {!isCustomHomepage && (
        <Suspense fallback={null}>
          <Header header={header} />
        </Suspense>
      )}
      {children}
      {!isCustomHomepage && (
        <Suspense fallback={null}>
          <Footer footer={footer} />
        </Suspense>
      )}
    </div>
  );
}
