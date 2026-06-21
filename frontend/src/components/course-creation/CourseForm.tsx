'use client';

import { useState } from 'react';
import { CourseDifficulty } from '@/types/course';
import { Button, Input, Textarea, Select, Badge, FormGroup } from '@/components/ui';
import { Card } from '@/components/ui';

interface CourseFormData {
  topic: string;
  difficulty: CourseDifficulty | '';
  targetAudience: string;
  duration: number | '';
  tags: string[];
}

interface CourseFormProps {
  onSubmit: (data: CourseFormData) => void;
  isLoading?: boolean;
}

export function CourseForm({ onSubmit, isLoading = false }: CourseFormProps) {
  const [formData, setFormData] = useState<CourseFormData>({
    topic: '',
    difficulty: '',
    targetAudience: '',
    duration: '',
    tags: [],
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.topic.trim() || formData.topic.length < 3) {
      newErrors.topic = 'Topic must be at least 3 characters';
    }

    if (!formData.difficulty) {
      newErrors.difficulty = 'Please select a difficulty level';
    }

    if (!formData.targetAudience.trim() || formData.targetAudience.length < 10) {
      newErrors.targetAudience = 'Please describe your target audience (min 10 chars)';
    }

    if (!formData.duration || formData.duration < 1 || formData.duration > 100) {
      newErrors.duration = 'Duration must be between 1 and 100 hours';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();

    if (trimmedTag && formData.tags.length < 5) {
      if (!formData.tags.includes(trimmedTag)) {
        setFormData({
          ...formData,
          tags: [...formData.tags, trimmedTag],
        });
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const isFormValid =
    formData.topic.trim().length >= 3 &&
    formData.difficulty &&
    formData.targetAudience.trim().length >= 10 &&
    formData.duration &&
    formData.duration >= 1 &&
    formData.duration <= 100;

  return (
    <Card variant="elevated" className="space-y-lg">
      <div>
        <h2 className="text-headline-lg text-on-background">Create Your Course</h2>
        <p className="text-body-md text-on-surface-variant mt-sm">
          Tell us about your course idea and our AI will create the complete curriculum
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-lg">
        <FormGroup>
          {/* Topic */}
          <Input
            label="What topic do you want to teach?"
            placeholder="e.g., Machine Learning, Web Design, Marketing"
            value={formData.topic}
            onChange={(e) => {
              setFormData({ ...formData, topic: e.target.value });
              if (errors.topic) {
                setErrors({ ...errors, topic: '' });
              }
            }}
            error={errors.topic}
            disabled={isLoading}
          />

          {/* Difficulty */}
          <Select
            label="Course Difficulty Level"
            value={formData.difficulty}
            onChange={(e) => {
              setFormData({
                ...formData,
                difficulty: e.target.value as CourseDifficulty,
              });
              if (errors.difficulty) {
                setErrors({ ...errors, difficulty: '' });
              }
            }}
            error={errors.difficulty}
            disabled={isLoading}
            options={[
              { value: '', label: '-- Select difficulty --', disabled: true },
              { value: 'BEGINNER', label: 'Beginner' },
              { value: 'INTERMEDIATE', label: 'Intermediate' },
              { value: 'ADVANCED', label: 'Advanced' },
            ]}
          />

          {/* Target Audience */}
          <Textarea
            label="Who is this course for?"
            placeholder="e.g., Software developers, Product managers, Entrepreneurs"
            value={formData.targetAudience}
            onChange={(e) => {
              setFormData({ ...formData, targetAudience: e.target.value });
              if (errors.targetAudience) {
                setErrors({ ...errors, targetAudience: '' });
              }
            }}
            error={errors.targetAudience}
            disabled={isLoading}
          />

          {/* Duration */}
          <Input
            label="Course Duration (hours)"
            type="number"
            placeholder="e.g., 12"
            value={formData.duration}
            onChange={(e) => {
              setFormData({
                ...formData,
                duration: e.target.value ? parseInt(e.target.value) : '',
              });
              if (errors.duration) {
                setErrors({ ...errors, duration: '' });
              }
            }}
            error={errors.duration}
            disabled={isLoading}
            helperText="Estimated hours for learners to complete this course"
          />
        </FormGroup>

        {/* Tags */}
        <FormGroup>
          <label className="block text-label-md font-medium text-on-surface mb-sm">
            Relevant Topics (optional, max 5)
          </label>
          <div className="space-y-sm">
            {/* Tag Input */}
            <div className="flex gap-sm">
              <input
                type="text"
                placeholder="e.g., AI, Machine Learning"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading || formData.tags.length >= 5}
                className="flex-1 px-md py-sm rounded-lg border-2 border-outline-variant bg-surface text-on-surface placeholder-on-surface-variant focus:border-primary focus:outline-none focus-ring transition-fast disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <Button
                variant="secondary"
                size="md"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || isLoading || formData.tags.length >= 5}
                type="button"
              >
                Add
              </Button>
            </div>

            {/* Tag Badges */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-sm">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="primary">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      disabled={isLoading}
                      className="ml-xs hover:opacity-70 disabled:opacity-50 font-bold text-sm"
                      aria-label={`Remove ${tag}`}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {formData.tags.length > 0 && (
              <p className="text-label-sm text-on-surface-variant">
                {formData.tags.length} / 5 tags added
              </p>
            )}
          </div>
        </FormGroup>

        {/* Submit Button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          type="submit"
          disabled={!isFormValid || isLoading}
          loading={isLoading}
        >
          {isLoading ? 'Generating Course...' : 'Generate with AI'}
        </Button>

        {isLoading && (
          <p className="text-center text-body-md text-on-surface-variant">
            This may take a few moments...
          </p>
        )}
      </form>
    </Card>
  );
}
