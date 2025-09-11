import type { PageLoad } from './$types';
import type { PageData } from './types';
import { get } from 'svelte/store';
import { people } from '$lib/stores';
import type { Person } from '$lib/stores';

export const load = (({ data }: { data: PageData }) => {
  const store = get(people);
  
  return {
    person: data.id ? store.data.find((p: Person) => p.id === data.id) : undefined
  };
}) satisfies PageLoad;
