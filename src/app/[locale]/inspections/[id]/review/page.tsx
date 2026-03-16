import { getTranslations } from 'next-intl/server';

import ReviewClient from './ReviewClient';

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations('inspections.review');

  return <ReviewClient inspectionId={id} translations={t} />;
}
