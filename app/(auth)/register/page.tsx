'use client';

import { useState } from 'react';

export default function RegisterPage() {
  const [inputValue, setInputValue] = useState({
    username: '',
    email: '',
    password: ''
  });
  return <div>RegisterPage</div>;
}
