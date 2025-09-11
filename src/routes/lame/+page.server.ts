import type { PageServerLoad } from './$types';
import type { PageData } from './types';

export const load = (({ url }) => {
  const id = url.searchParams.get('id');
  return { id } satisfies PageData;
}) satisfies PageServerLoad<PageData>;
