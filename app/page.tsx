import { auth } from '@/libs/auth';

export default async function Home() {
  const session = await auth();
  console.log(' page session ===> ', session);

  return <>hello Jaaaa</>;
}
