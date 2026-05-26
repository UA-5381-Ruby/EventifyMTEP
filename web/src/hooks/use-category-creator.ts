import React from 'react';
import axios from 'axios';
import { useState, useRef } from 'react';
import { CategoriesService } from '@/services/categories-service';
import type { Category } from '@/types/category';

interface UseCategoryCreatorOptions {
  onCreated: (id: number) => void;
}

export interface UseCategoryCreatorResult {
  extraCategories: Category[];
  newCatName: string;
  isCreatingCat: boolean;
  catError: string | null;
  showCatInput: boolean;
  catInputRef: React.RefObject<HTMLInputElement | null>;
  setNewCatName: (name: string) => void;
  handleShowCatInput: () => void;
  handleCancelCatCreate: () => void;
  handleCreateCategory: () => Promise<void>;
  handleCatKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function useCategoryCreator({
  onCreated,
}: UseCategoryCreatorOptions): UseCategoryCreatorResult {
  const [extraCategories, setExtraCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);
  const [showCatInput, setShowCatInput] = useState(false);
  const catInputRef = useRef<HTMLInputElement>(null);

  const handleShowCatInput = () => {
    setShowCatInput(true);
    setCatError(null);
    setTimeout(() => catInputRef.current?.focus(), 50);
  };

  const handleCancelCatCreate = () => {
    setShowCatInput(false);
    setNewCatName('');
    setCatError(null);
  };

  const handleCreateCategory = async () => {
    if (isCreatingCat) return;

    const name = newCatName.trim();
    if (!/^[a-zA-Z0-9\s-]{2,30}$/.test(name)) {
      setCatError('Invalid category name format.');
      return;
    }

    if (!name) {
      setCatError('Category name cannot be empty.');
      return;
    }

    setIsCreatingCat(true);
    setCatError(null);

    try {
      const created = await CategoriesService.createCategory({ name });

      setExtraCategories((prev) => [...prev, created]);
      onCreated(created.id);

      setNewCatName('');
      setShowCatInput(false);
    } catch (err: unknown) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;

      if (status === 409) {
        setCatError('Category already exists.');
      } else if (status === 422) {
        setCatError('Invalid category name.');
      } else {
        setCatError(err instanceof Error ? err.message : 'Failed to create category.');
      }
    } finally {
      setIsCreatingCat(false);
    }
  };

  const handleCatKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleCreateCategory();
    } else if (e.key === 'Escape') {
      handleCancelCatCreate();
    }
  };

  return {
    extraCategories,
    newCatName,
    isCreatingCat,
    catError,
    showCatInput,
    catInputRef,
    setNewCatName,
    handleShowCatInput,
    handleCancelCatCreate,
    handleCreateCategory,
    handleCatKeyDown,
  };
}
