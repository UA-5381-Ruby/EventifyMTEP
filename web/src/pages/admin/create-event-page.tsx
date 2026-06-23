import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { CategoriesService } from '@/services/categories-service';
import type { Brand } from '@/types/brand';
import type { Category } from '@/types/category';
import { Button, Alert, Spinner, Card } from '@/components/ui';
import { Plus } from 'lucide-react';

import { EventFormFields } from '../../components/admin/event/event-form-fields.tsx';
import { CategoryChip } from '@/components/admin/category-chip.tsx';
import { CreateCategoryModal } from '@/components/admin/modals/create-category-modal.tsx';
import { useCreateEvent } from '@/hooks/use-create-event.ts';

export const CreateEventPage = () => {
  const navigate = useNavigate();
  const { brand } = useOutletContext<{ brand: Brand }>();

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const { fields, isSaving, saveError, handleFieldChange, handleSave } = useCreateEvent(
    brand.id,
    () => navigate('/dashboard/events')
  );

  useEffect(() => {
    CategoriesService.getCategories().then(setAllCategories).catch(console.error);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    handleFieldChange(name as keyof typeof fields, value as never);
  };

  const handleCategoryToggle = (categoryId: number) => {
    const next = fields.category_ids.includes(categoryId)
      ? fields.category_ids.filter((id) => id !== categoryId)
      : [...fields.category_ids, categoryId];
    handleFieldChange('category_ids', next);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsCreatingCategory(true);
    try {
      const newCat = await CategoriesService.createCategory({ name: newCategoryName });
      setAllCategories((prev) => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)));
      handleFieldChange('category_ids', [...fields.category_ids, newCat.id]);
      setNewCategoryName('');
      setIsModalOpen(false);
    } catch {
      alert('Error creating category');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSave();
  };

  return (
    <div className="w-full flex justify-center items-start pt-4 pb-20 animate-in fade-in duration-700 text-black">
      <div className="w-full max-w-2xl px-4">
        <Card className="p-10 bg-white shadow-none border border-neutral-200 rounded-none relative">
          <h1 className="text-2xl font-bold mb-10 uppercase">Create New Event</h1>

          {saveError && (
            <Alert variant="warning" className="mb-8">
              {saveError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <EventFormFields formData={fields} onChange={handleInputChange} />

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-neutral-400">
                  Categories
                </label>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-1 text-[10px] font-bold text-blue-600"
                >
                  <Plus className="w-3 h-3" /> Add New
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {allCategories.map((cat) => (
                  <CategoryChip
                    key={cat.id}
                    name={cat.name}
                    isSelected={fields.category_ids.includes(cat.id)}
                    onClick={() => handleCategoryToggle(cat.id)}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-12 border-t border-neutral-100">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/dashboard/events')}
                className="rounded-none px-10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="rounded-none bg-black text-white px-10"
              >
                {isSaving ? <Spinner className="w-4 h-4" /> : 'Create Event'}
              </Button>
            </div>
          </form>

          <CreateCategoryModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleCreateCategory}
            name={newCategoryName}
            setName={setNewCategoryName}
            isLoading={isCreatingCategory}
          />
        </Card>
      </div>
    </div>
  );
};
