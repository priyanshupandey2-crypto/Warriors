'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CoursePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    router.push(`/courses/${id}`);
  }, [id, router]);

  return null;
}
