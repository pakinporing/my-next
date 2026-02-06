import { PropsWithChildren } from 'react';

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <>
      <div>
        auth layout
        {children}
      </div>
      ;
    </>
  );
}
