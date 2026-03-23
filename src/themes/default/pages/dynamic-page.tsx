import React from 'react';
import { getThemeBlock } from '@/core/theme';
import type { DynamicPage as DynamicPageType } from '@/shared/types/blocks/landing';

export default async function DynamicPage({
  locale,
  page,
  data,
}: {
  locale?: string;
  page: DynamicPageType;
  data?: Record<string, any>;
}) {
  // Pre-load all blocks
  const sectionsToRender: Array<{ key: string; component: React.ReactNode; section: any }> = [];

  if (page?.sections) {
    for (const sectionKey of Object.keys(page.sections)) {
      const section = page.sections?.[sectionKey];
      if (!section || section.disabled === true) {
        continue;
      }

      if (page.show_sections && !page.show_sections.includes(sectionKey)) {
        continue;
      }

      // block name
      const block = section.block || section.id || sectionKey;

      try {
        if (section.component) {
          sectionsToRender.push({
            key: sectionKey,
            component: section.component,
            section
          });
          continue;
        }

        const DynamicBlock = await getThemeBlock(block);
        sectionsToRender.push({
          key: sectionKey,
          component: (
            <DynamicBlock
              key={sectionKey}
              section={section}
              {...(data || section.data || {})}
            />
          ),
          section
        });
      } catch (error) {
        // Skip failed blocks
      }
    }
  }

  return (
    <>
      {page.title && !page.sections?.hero && (
        <h1 className="sr-only">{page.title}</h1>
      )}
      {sectionsToRender.map(({ key, component }) => (
        <React.Fragment key={key}>{component}</React.Fragment>
      ))}
    </>
  );
}
