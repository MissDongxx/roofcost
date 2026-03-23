import { ReactNode, Suspense, Children } from 'react';
import { getTranslations } from 'next-intl/server';
import { getThemeBlock } from '@/core/theme';
import {
  Footer as FooterType,
  Header as HeaderType,
} from '@/shared/types/blocks/landing';

export default async function LandingLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Check if we're rendering the custom homepage
  let isCustomHomepage = false;

  const findCustomHomepageProp = (node: any): boolean => {
    if (!node) return false;
    if (node.props?.isCustomHomepage === true) return true;
    if (node.props?.children) {
      if (Array.isArray(node.props.children)) {
        return node.props.children.some(findCustomHomepageProp);
      }
      return findCustomHomepageProp(node.props.children);
    }
    return false;
  };

  Children.forEach(children, (child) => {
    if (findCustomHomepageProp(child)) {
      isCustomHomepage = true;
    }
  });

  // Fetch header/footer data from translations
  // Since this is a layout, we must fetch data here as Next.js doesn't pass it as props
  const t = await getTranslations('landing');
  const header = t.raw('header') as HeaderType;
  const footer = t.raw('footer') as FooterType;

  const Header = await getThemeBlock('header');
  const Footer = await getThemeBlock('footer');

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <Header header={header} />
      </Suspense>
      <main className="flex-1">
        {children}
      </main>
      <Suspense fallback={null}>
        <Footer footer={footer} />
      </Suspense>
    </div>
  );
}
