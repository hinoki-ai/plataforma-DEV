'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload, type FileWithPreview } from '@/components/ui/file-upload';
import type { SimpleFileMetadata as FileMetadata } from '@/lib/simple-upload';
import { useResponsiveMode } from '@/lib/hooks/useDesktopToggle';
import { layout, forms } from '@/lib/responsive-utils';
import { SUBJECTS, GRADES } from '@/lib/constants';

// i18n
import { useLanguage } from '@/components/language/LanguageContext';

interface PlanningDocumentFormProps {
  action: ((data: any) => Promise<{ success: boolean; error?: string }>) | ((formData: FormData) => void | Promise<void>);
  initialData?: {
    title: string;
    content: string;
    subject: string;
    grade: string;
    attachments?: FileMetadata[];
  };
  isEditing?: boolean;
}

function SubmitButton({ isEditing, t }: { isEditing?: boolean; t: (key: string, namespace?: string) => string }) {
  const { pending } = useFormStatus();
  const { isDesktopForced } = useResponsiveMode();

  return (
    <Button
      type="submit"
      disabled={pending}
      className={`w-full ${forms.button(isDesktopForced)}`}
    >
      {pending
        ? isEditing
          ? t('planning.updating', 'common')
          : t('planning.creating', 'common')
        : isEditing
          ? t('planning.update', 'common')
          : t('planning.create', 'common')}
    </Button>
  );
}

export function PlanningDocumentForm({
  action,
  initialData,
  isEditing = false,
}: PlanningDocumentFormProps) {
  const [uploadedFiles, setUploadedFiles] = useState<FileMetadata[]>(
    initialData?.attachments || []
  );
  const [isUploading, setIsUploading] = useState(false);
  const { isDesktopForced } = useResponsiveMode();
  const { t } = useLanguage();

  const handleFilesChange = async (files: FileWithPreview[]) => {
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadedFiles(prev => [...prev, ...result.files]);
      } else {
        console.error('Upload failed:', result.error);
        // Error will be handled by parent component or toast notification
      }
    } catch (error) {
      console.error('Upload error:', error);
      // Error will be handled by parent component or toast notification
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/upload?publicId=${fileId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
      } else {
        console.error('Delete failed:', result.error);
        // Error will be handled by parent component or toast notification
      }
    } catch (error) {
      console.error('Delete error:', error);
      // Error will be handled by parent component or toast notification
    }
  };

  const handleSubmit = async (formData: FormData) => {
    // Add attachments to formData
    formData.append('attachments', JSON.stringify(uploadedFiles));
    
    try {
      // Check if action is a server action (takes FormData) or a regular action (takes object)
      const actionResult = action(formData);
      
      // If it returns a promise with success/error, handle it
      if (actionResult && typeof actionResult === 'object' && 'then' in actionResult) {
        const result = await actionResult;
        if (result && 'success' in result && !result.success && result.error) {
          console.error('Form submission error:', result.error);
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? t('planning.title.edit', 'common') : t('planning.title', 'common')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className={layout.grid.form(isDesktopForced)}>
            <div className="space-y-2">
              <Label htmlFor="title" aria-required="true">
                {t('planning.title.label', 'common')}{' '}
                <span className="text-error-600" aria-hidden="true">
                  *
                </span>
              </Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={initialData?.title}
                placeholder={t('planning.title.placeholder', 'common')}
                className={forms.input(isDesktopForced)}
                aria-required="true"
                aria-describedby="title-help"
              />
              <p id="title-help" className="text-sm text-muted-foreground">
                {t('planning.title.help', 'common')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" aria-required="true">
                {t('planning.subject.label', 'common')}{' '}
                <span className="text-error-600" aria-hidden="true">
                  *
                </span>
              </Label>
              <select
                id="subject"
                name="subject"
                required
                defaultValue={initialData?.subject}
                aria-required="true"
                aria-describedby="subject-help"
                title="Seleccionar asignatura"
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${forms.input(isDesktopForced)}`}
              >
                <option value="">{t('planning.subject.placeholder', 'common')}</option>
                {SUBJECTS.map(subject => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
              <p id="subject-help" className="text-sm text-muted-foreground">
                {t('planning.subject.help', 'common')}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade" aria-required="true">
              {t('planning.grade.label', 'common')}{' '}
              <span className="text-error-600" aria-hidden="true">
                *
              </span>
            </Label>
            <select
              id="grade"
              name="grade"
              required
              defaultValue={initialData?.grade}
              aria-required="true"
              aria-describedby="grade-help"
              title="Seleccionar curso"
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${forms.input(isDesktopForced)}`}
            >
              <option value="">{t('planning.grade.placeholder', 'common')}</option>
              {GRADES.map(grade => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
            <p id="grade-help" className="text-sm text-muted-foreground">
              {t('planning.grade.help', 'common')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" aria-required="true">
              {t('planning.content.label', 'common')}{' '}
              <span className="text-error-600" aria-hidden="true">
                *
              </span>
            </Label>
            <Textarea
              id="content"
              name="content"
              required
              rows={isDesktopForced ? 16 : 12}
              defaultValue={initialData?.content}
              placeholder={t('planning.content.placeholder', 'common')}
              className={`resize-none ${forms.textarea(isDesktopForced)}`}
              aria-required="true"
              aria-describedby="content-help"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachments" aria-describedby="attachments-help">
              {t('planning.attachments.label', 'common')}
            </Label>
            <p id="content-help" className="text-sm text-muted-foreground">
              {t('planning.content.help', 'common')}
            </p>
            <p id="attachments-help" className="text-sm text-muted-foreground">
              {t('planning.attachments.help', 'common')}
            </p>
            <FileUpload
              onFilesChange={handleFilesChange}
              disabled={isUploading}
              maxFiles={5}
              maxSize={10 * 1024 * 1024} // 10MB
            />
            {isUploading && (
              <p className="text-sm text-blue-600">{t('planning.uploading', 'common')}</p>
            )}

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">{t('planning.saved.files', 'common')}</h4>
                <div className="space-y-2">
                  {uploadedFiles.map(file => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-green-600">✓</div>
                        <div>
                          <p className="text-sm font-medium">{file.filename}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB • {t('planning.file.saved', 'common')}{' '}
                            {new Date(file.uploadedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a
                          href={file.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {t('planning.file.view', 'common')}
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(file.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          {t('planning.file.delete', 'common')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <SubmitButton isEditing={isEditing} t={t} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
