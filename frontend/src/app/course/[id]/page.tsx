import { redirect } from 'next/navigation';

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  redirect(`/courses/${params.id}`);
}
