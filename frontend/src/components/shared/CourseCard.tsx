'use client';

import Link from 'next/link';
import { Star, Clock } from 'lucide-react';

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  rating: number;
  students?: string;
}

const getLevelIcon = (level: string) => {
  switch (level) {
    case 'Advanced':
      return 'signal_cellular_alt';
    case 'Intermediate':
      return 'signal_cellular_alt_2_bar';
    case 'Beginner':
      return 'signal_cellular_alt_1_bar';
    default:
      return '';
  }
};

export default function CourseCard({
  id,
  title,
  description,
  image,
  category,
  level,
  duration,
  rating,
  students,
}: CourseCardProps) {
  return (
    <Link href={`/courses/${id}`} className="block group h-full">
      <div className="group bg-surface shadow-sm hover:shadow-xl rounded-xl overflow-hidden border border-surface-container-high transition-all duration-300 flex flex-col h-full">
        {/* Image Section */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-md right-md">
            <span className="bg-primary-container/90 backdrop-blur-sm text-on-primary-container font-label-sm text-label-sm px-md py-xs rounded-full">
              {category}
            </span>
          </div>
          {students && (
            <div className="absolute bottom-md left-md flex items-center gap-xs bg-green-500/90 text-white px-sm py-xs rounded-full text-label-xs font-bold">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              <span>{students} now</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-lg flex-1 flex flex-col">
          {/* Level Badge */}
          <div className="flex items-center gap-xs text-primary mb-sm">
            <span className="material-symbols-outlined text-[18px]">{getLevelIcon(level)}</span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider font-bold">{level}</span>
          </div>

          {/* Title */}
          <h3 className="font-headline-md text-headline-md text-on-surface mb-sm leading-tight line-clamp-2">
            {title}
          </h3>

          {/* Description */}
          <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-lg flex-grow">
            {description}
          </p>

          {/* Footer */}
          <div className="mt-auto pt-lg border-t border-surface-variant flex items-center justify-between">
            <div className="flex items-center gap-xs text-on-surface-variant">
              <Clock className="w-4 h-4" />
              <span className="font-label-md text-label-md">{duration}</span>
            </div>
            <div className="flex items-center gap-xs">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-label-md text-label-md font-bold text-on-surface">{rating}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
