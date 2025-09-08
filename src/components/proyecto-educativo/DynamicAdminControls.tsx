// ⚡ Performance: Dynamic admin controls for PPR
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Edit, Trash2 } from 'lucide-react';

// i18n
import { useLanguage } from '@/components/language/LanguageContext';

type VideoCapsule = {
  id: string;
  title: string;
  url: string;
  description?: string;
  isActive: boolean;
};

interface DynamicAdminControlsProps {
  videoCapsule: VideoCapsule;
  onUpdate: (capsule: VideoCapsule) => void;
}

export function DynamicAdminControls({
  videoCapsule,
  onUpdate,
}: DynamicAdminControlsProps) {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const isAdmin = session?.user?.role === 'ADMIN';

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCapsule, setEditingCapsule] =
    useState<VideoCapsule>(videoCapsule);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setEditingCapsule(videoCapsule);
    setEditModalOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/proyecto-educativo/video-capsule', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingCapsule),
      });

      if (response.ok) {
        const data = await response.json();
        onUpdate(data.videoCapsule);
        setEditModalOpen(false);
      }
    } catch (error) {
      console.error('Error saving video capsule:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(t('video.delete.confirm', 'common'))) {
      try {
        const response = await fetch('/api/proyecto-educativo/video-capsule', {
          method: 'DELETE',
        });

        if (response.ok) {
          onUpdate({
            id: 'default-capsule',
            title: 'Cápsula de Video Educativo',
            url: '',
            description: 'Video sobre nuestro enfoque educativo',
            isActive: false,
          });
        }
      } catch (error) {
        console.error('Error deleting video capsule:', error);
      }
    }
  };

  // Don't render controls if not admin
  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleEdit}
          className="text-white border-white/20 hover:bg-white/10"
        >
          <Edit className="w-4 h-4 mr-2" />
          {t('video.edit', 'common')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          className="text-red-400 border-red-400/20 hover:bg-red-400/10"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {t('video.delete', 'common')}
        </Button>
      </div>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('video.edit.title', 'common')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium">{t('video.title.label', 'common')}</label>
              <Input
                value={editingCapsule.title}
                onChange={e =>
                  setEditingCapsule({
                    ...editingCapsule,
                    title: e.target.value,
                  })
                }
                className="col-span-3"
                placeholder={t('video.title.placeholder', 'common')}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium">{t('video.url.label', 'common')}</label>
              <Input
                value={editingCapsule.url}
                onChange={e =>
                  setEditingCapsule({ ...editingCapsule, url: e.target.value })
                }
                className="col-span-3"
                placeholder={t('video.url.placeholder', 'common')}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-sm font-medium">{t('video.description.label', 'common')}</label>
              <Input
                value={editingCapsule.description || ''}
                onChange={e =>
                  setEditingCapsule({
                    ...editingCapsule,
                    description: e.target.value,
                  })
                }
                className="col-span-3"
                placeholder={t('video.description.placeholder', 'common')}
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium" htmlFor="video-active">
                {t('video.active.label', 'common')}
              </label>
              <input
                id="video-active"
                type="checkbox"
                checked={editingCapsule.isActive}
                onChange={e =>
                  setEditingCapsule({
                    ...editingCapsule,
                    isActive: e.target.checked,
                  })
                }
                className="rounded border-gray-300"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                {t('common.cancel', 'common')}
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? t('video.saving', 'common') : t('video.save', 'common')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ⚡ Performance: Loading skeleton for admin controls
export function AdminControlsSkeleton() {
  return (
    <div className="flex gap-2">
      <div className="h-8 w-20 bg-gray-700/50 rounded animate-pulse" />
      <div className="h-8 w-20 bg-gray-700/50 rounded animate-pulse" />
    </div>
  );
}
