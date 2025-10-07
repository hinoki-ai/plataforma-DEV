'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TeamMemberSchema, TeamMemberInput } from '@/lib/validation';
import {
  createTeamMember,
  updateTeamMember,
} from '@/services/actions/team-members';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { TeamMember } from '@/lib/prisma-compat-types';
import { ActionLoader } from '@/components/ui/dashboard-loader';

// i18n
import { useLanguage } from '@/components/language/LanguageContext';

/**
 * Team Member Form Component
 *
 * A comprehensive form for creating and editing team members with support for:
 * - Basic information (name, title, description)
 * - Image upload and management
 * - Specialties management with dynamic addition/removal
 * - Status and ordering controls
 * - Form validation with Zod schema
 * - Internationalization support
 *
 * ## Features
 * - Create new team members or edit existing ones
 * - Image upload with preview and Cloudinary integration
 * - Dynamic specialties management (add/remove)
 * - Form validation with real-time error feedback
 * - Loading states and success/error notifications
 * - Automatic navigation after successful operations
 *
 * ## Usage
 * ```tsx
 * // Create new member
 * <TeamMemberForm />
 *
 * // Edit existing member
 * <TeamMemberForm teamMember={existingMember} />
 * ```
 *
 * @param teamMember - Optional existing team member to edit
 */
interface TeamMemberFormProps {
  teamMember?: TeamMember;
}

export function TeamMemberForm({ teamMember }: TeamMemberFormProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [specialties, setSpecialties] = useState<string[]>(
    teamMember ? (teamMember.specialties as string[]) : []
  );
  const [currentSpecialty, setCurrentSpecialty] = useState('');
  const [fileImage, setFileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    teamMember?.imageUrl || ''
  );
  const [useFileUpload, setUseFileUpload] = useState(!teamMember?.imageUrl);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TeamMemberInput>({
    resolver: zodResolver(TeamMemberSchema),
    defaultValues: {
      name: teamMember?.name || '',
      title: teamMember?.title || '',
      description: teamMember?.description || '',
      imageUrl: teamMember?.imageUrl || '',
      order: teamMember?.order || 0,
      isActive: true,
      specialties: teamMember ? (teamMember.specialties as string[]) : [],
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(t('team.form.image.upload.error', 'common'));
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      throw new Error(t('team.form.image.upload.error', 'common'));
    }
  };

  const onSubmit = async (data: TeamMemberInput) => {
    if (specialties.length === 0) {
      toast.error(t('team.form.specialties.required', 'common'));
      return;
    }

    setIsLoading(true);
    try {
      let imageUrl = data.imageUrl;

      if (useFileUpload && fileImage) {
        imageUrl = await uploadImage(fileImage);
      } else if (!useFileUpload && !data.imageUrl) {
        imageUrl = '';
      }

      const formData = {
        ...data,
        imageUrl,
        specialties,
      };

      if (teamMember) {
        await updateTeamMember(teamMember.id, formData);
        toast.success(t('team.form.save.success', 'common'));
      } else {
        await createTeamMember(formData);
        toast.success(t('team.form.save.success', 'common'));
      }

      router.push('/admin/equipo-multidisciplinario');
    } catch (error) {
      toast.error(t('team.form.save.error', 'common'));
    } finally {
      setIsLoading(false);
    }
  };

  const addSpecialty = () => {
    if (currentSpecialty.trim()) {
      setSpecialties([...specialties, currentSpecialty.trim()]);
      setCurrentSpecialty('');
    }
  };

  const removeSpecialty = (index: number) => {
    setSpecialties(specialties.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSpecialty();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{teamMember ? t('team.form.title.edit', 'common') : t('team.form.title.create', 'common')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">{t('team.form.name.label', 'common')}</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder={t('user.name.placeholder', 'common')}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">{t('team.form.title.label', 'common')}</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder={t('team.form.specialties.placeholder', 'common')}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('team.form.description.label', 'common')}</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={t('team.form.description.label', 'common').toLowerCase() + " the member's profile and responsibilities..."}
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={useFileUpload}
                onCheckedChange={setUseFileUpload}
              />
              <Label className="cursor-pointer">
                {useFileUpload ? t('team.form.image.upload', 'common') : t('team.form.image.url', 'common')}
              </Label>
            </div>

            {useFileUpload ? (
              <div className="space-y-2">
                <Label htmlFor="file-upload">{t('team.form.image.label', 'common')}</Label>
                <div className="flex flex-col space-y-2">
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Vista previa"
                        className="h-32 w-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="imageUrl">{t('team.form.image.label', 'common')} URL</Label>
                <Input
                  id="imageUrl"
                  {...register('imageUrl')}
                  placeholder={t('team.form.image.url.placeholder', 'common')}
                  onChange={e => {
                    setImagePreview(e.target.value);
                    setValue('imageUrl', e.target.value);
                  }}
                />
                {errors.imageUrl && (
                  <p className="text-sm text-red-500">
                    {errors.imageUrl.message}
                  </p>
                )}
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Vista previa"
                      className="h-32 w-32 object-cover rounded-lg border"
                      onError={() => setImagePreview('')}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t('team.form.specialties.label', 'common')}</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={currentSpecialty}
                  onChange={e => setCurrentSpecialty(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('team.form.specialties.add', 'common')}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSpecialty}
                  disabled={!currentSpecialty.trim()}
                >
                  <PlusCircle className="w-4 h-4" />
                </Button>
              </div>

              {specialties.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {specialties.map((specialty, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md"
                    >
                      <span className="text-sm">{specialty}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeSpecialty(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order">{t('team.form.order.label', 'common')}</Label>
              <Input
                id="order"
                type="number"
                {...register('order', { valueAsNumber: true })}
                min="0"
              />
              {errors.order && (
                <p className="text-sm text-red-500">{errors.order.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">Estado</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  {...register('isActive')}
                  checked={watch('isActive')}
                  onCheckedChange={checked => setValue('isActive', checked)}
                />
                <span className="text-sm">
                  {watch('isActive') ? t('common.active', 'common') : t('common.inactive', 'common')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/equipo-multidisciplinario')}
            >
              {t('team.form.cancel', 'common')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <ActionLoader size="sm" />
              ) : teamMember ? (
                t('planning.update', 'common')
              ) : (
                t('common.create', 'common')
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
