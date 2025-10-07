/**
 * State Management Patterns
 * Standardizes state management approaches across components
 * Part of Stage 3: Business Logic Unification
 */

import { useCallback, useReducer, useState } from "react";
import { UserRole } from "@/lib/prisma-compat-types";

export type ExtendedUserRole = UserRole;

// Standard loading states
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  lastUpdated?: Date;
}

// Standard form states
export interface FormState<T = any> {
  data: T;
  isDirty: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// Standard list states
export interface ListState<T = any> {
  items: T[];
  filteredItems: T[];
  searchQuery: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  loading: LoadingState;
}

/**
 * Standard loading state hook
 */
export function useLoadingState(initialLoading = false) {
  const [state, setState] = useState<LoadingState>({
    isLoading: initialLoading,
    error: null,
    lastUpdated: undefined,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, isLoading: loading, error: null }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error, isLoading: false }));
  }, []);

  const setSuccess = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isLoading: false,
      error: null,
      lastUpdated: new Date(),
    }));
  }, []);

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, lastUpdated: undefined });
  }, []);

  return {
    ...state,
    setLoading,
    setError,
    setSuccess,
    reset,
  };
}

/**
 * Standard form state hook
 */
export function useFormState<T extends Record<string, any>>(initialData: T) {
  const [state, setState] = useState<FormState<T>>({
    data: initialData,
    isDirty: false,
    isSubmitting: false,
    errors: {},
    touched: {},
  });

  const updateField = useCallback((field: keyof T, value: any) => {
    setState((prev) => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      isDirty: true,
      touched: { ...prev.touched, [field]: true },
      errors: { ...prev.errors, [field]: "" }, // Clear error when user types
    }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
    }));
  }, []);

  const setErrors = useCallback((errors: Record<string, string>) => {
    setState((prev) => ({ ...prev, errors }));
  }, []);

  const setSubmitting = useCallback((submitting: boolean) => {
    setState((prev) => ({ ...prev, isSubmitting: submitting }));
  }, []);

  const reset = useCallback(
    (newData?: T) => {
      setState({
        data: newData || initialData,
        isDirty: false,
        isSubmitting: false,
        errors: {},
        touched: {},
      });
    },
    [initialData],
  );

  const hasErrors = Object.values(state.errors).some(
    (error) => error.length > 0,
  );
  const canSubmit = state.isDirty && !hasErrors && !state.isSubmitting;

  return {
    ...state,
    updateField,
    setFieldError,
    setErrors,
    setSubmitting,
    reset,
    hasErrors,
    canSubmit,
  };
}

/**
 * Standard list state hook with filtering and pagination
 */
export function useListState<T extends { id: string }>(initialItems: T[] = []) {
  const [state, setState] = useState<ListState<T>>({
    items: initialItems,
    filteredItems: initialItems,
    searchQuery: "",
    sortBy: "id",
    sortOrder: "asc",
    pagination: {
      page: 1,
      limit: 10,
      total: initialItems.length,
    },
    loading: {
      isLoading: false,
      error: null,
    },
  });

  const setItems = useCallback((items: T[]) => {
    setState((prev) => ({
      ...prev,
      items,
      filteredItems: filterAndSort(
        items,
        prev.searchQuery,
        prev.sortBy,
        prev.sortOrder,
      ),
      pagination: { ...prev.pagination, total: items.length },
    }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState((prev) => {
      const filtered = filterAndSort(
        prev.items,
        query,
        prev.sortBy,
        prev.sortOrder,
      );
      return {
        ...prev,
        searchQuery: query,
        filteredItems: filtered,
        pagination: { ...prev.pagination, page: 1, total: filtered.length },
      };
    });
  }, []);

  const setSorting = useCallback(
    (sortBy: string, sortOrder: "asc" | "desc") => {
      setState((prev) => {
        const filtered = filterAndSort(
          prev.items,
          prev.searchQuery,
          sortBy,
          sortOrder,
        );
        return {
          ...prev,
          sortBy,
          sortOrder,
          filteredItems: filtered,
        };
      });
    },
    [],
  );

  const setPage = useCallback((page: number) => {
    setState((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, page },
    }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setState((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, limit, page: 1 },
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, isLoading: loading, error: null },
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({
      ...prev,
      loading: { ...prev.loading, error, isLoading: false },
    }));
  }, []);

  // Get paginated items
  const paginatedItems = getPaginatedItems(
    state.filteredItems,
    state.pagination.page,
    state.pagination.limit,
  );

  return {
    ...state,
    paginatedItems,
    setItems,
    setSearchQuery,
    setSorting,
    setPage,
    setLimit,
    setLoading,
    setError,
  };
}

/**
 * Role-aware state management
 */
export function useRoleAwareState<T>(
  userRole: ExtendedUserRole,
  permissions: {
    canRead: boolean;
    canWrite: boolean;
    canDelete: boolean;
  },
) {
  const [state, setState] = useState<{
    userRole: ExtendedUserRole;
    permissions: typeof permissions;
    isAuthorized: boolean;
  }>({
    userRole,
    permissions,
    isAuthorized: permissions.canRead, // Basic authorization check
  });

  const checkPermission = useCallback(
    (action: "read" | "write" | "delete"): boolean => {
      switch (action) {
        case "read":
          return state.permissions.canRead;
        case "write":
          return state.permissions.canWrite;
        case "delete":
          return state.permissions.canDelete;
        default:
          return false;
      }
    },
    [state.permissions],
  );

  const updatePermissions = useCallback(
    (newPermissions: Partial<typeof permissions>) => {
      setState((prev) => ({
        ...prev,
        permissions: { ...prev.permissions, ...newPermissions },
        isAuthorized:
          newPermissions.canRead !== undefined
            ? newPermissions.canRead
            : prev.permissions.canRead,
      }));
    },
    [],
  );

  return {
    ...state,
    checkPermission,
    updatePermissions,
  };
}

// Helper functions

function filterAndSort<T extends Record<string, any>>(
  items: T[],
  searchQuery: string,
  sortBy: string,
  sortOrder: "asc" | "desc",
): T[] {
  let filtered = items;

  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = items.filter((item) => {
      return Object.values(item).some(
        (value) => value && value.toString().toLowerCase().includes(query),
      );
    });
  }

  // Apply sorting
  filtered.sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (aValue === bValue) return 0;

    let comparison = 0;
    if (aValue > bValue) comparison = 1;
    if (aValue < bValue) comparison = -1;

    return sortOrder === "desc" ? -comparison : comparison;
  });

  return filtered;
}

function getPaginatedItems<T>(items: T[], page: number, limit: number): T[] {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return items.slice(startIndex, endIndex);
}

/**
 * Context-aware state patterns for different UI contexts
 */
export const statePatterns = {
  public: {
    defaultPageSize: 6,
    showSearchBar: true,
    showSorting: false,
    autoRefresh: false,
  },
  authenticated: {
    defaultPageSize: 10,
    showSearchBar: true,
    showSorting: true,
    autoRefresh: true,
  },
  admin: {
    defaultPageSize: 20,
    showSearchBar: true,
    showSorting: true,
    autoRefresh: true,
    showBulkActions: true,
  },
};

/**
 * Get state pattern based on user role
 */
export function getStatePattern(userRole?: ExtendedUserRole) {
  if (!userRole) return statePatterns.public;
  if (userRole === "ADMIN") return statePatterns.admin;
  return statePatterns.authenticated;
}
