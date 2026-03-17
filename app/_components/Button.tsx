'use client';

import { testApi } from '@/libs/action';

export default function Button() {
  return <button onClick={() => testApi()}>TEST API</button>;
}
