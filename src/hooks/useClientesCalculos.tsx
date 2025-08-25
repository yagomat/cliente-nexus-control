import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ClienteComCalculos {
  id: string;
  nome: string;
  telefone: string | null;
  uf: string | null;
  servidor: string;
  dispositivo_smart: string | null;
  aplicativo: string;
  usuario_aplicativo: string | null;
  senha_aplicativo: string | null;
  observacoes: string | null;
  codigo_pais: string;
  dia_vencimento: number;
  valor_plano: number | null;
  data_licenca_aplicativo: string | null;
  tela_adicional: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  aplicativo_2: string | null;
  usuario_aplicativo_2: string | null;
  senha_aplicativo_2: string | null;
  data_licenca_aplicativo_2: string | null;
  dispositivo_smart_2: string | null;
  // Campos calculados
  status_ativo: boolean;
  vencimento_dias: number | null;
  vencimento_texto: string | null;
  vencimento_vencido: boolean;
  ordem_vencimento: number;
}

interface PaginationInfo {
  total: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

interface UseClientesCalculosResult {
  clientes: ClienteComCalculos[];
  loading: boolean;
  pagination: PaginationInfo | null;
  fetchClientes: (filters: {
    search?: string;
    status?: string;
    ordenacao?: string;
    page?: number;
    itemsPerPage?: number;
    ano?: number;
  }, forceRefresh?: boolean) => Promise<void>;
  refreshClientes: (filters: {
    search?: string;
    status?: string;
    ordenacao?: string;
    page?: number;
    itemsPerPage?: number;
    ano?: number;
  }) => Promise<void>;
}

// Cache simples com TTL de 5 minutos
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos em milliseconds

const getCacheKey = (filters: any) => {
  // Normalizar busca vazia para consistência
  const normalizedFilters = {
    ...filters,
    search: filters.search?.trim() || ''
  };
  return JSON.stringify(normalizedFilters);
};

const getCachedData = (key: string) => {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: CACHE_TTL
  });
};

// Cache invalidation function
const invalidateCache = () => {
  cache.clear();
  console.log('Cache invalidated for clientes calculations');
};

// Export invalidation function for external use
export const invalidateClientesCache = invalidateCache;

export const useClientesCalculos = (): UseClientesCalculosResult => {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<ClienteComCalculos[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [lastSearch, setLastSearch] = useState<string>('');

  const fetchClientes = useCallback(async (filters: {
    search?: string;
    status?: string;
    ordenacao?: string;
    page?: number;
    itemsPerPage?: number;
    ano?: number;
  } = {}, forceRefresh = false) => {
    if (!user) return;

    const currentSearch = filters.search?.trim() || '';
    
    // Detectar se mudou de busca preenchida para vazia - força refresh
    const shouldForceRefresh = forceRefresh || (lastSearch && !currentSearch);
    
    // Debug logging
    console.log('fetchClientes called:', {
      search: currentSearch,
      lastSearch,
      shouldForceRefresh,
      filters
    });

    const cacheKey = getCacheKey({ ...filters, userId: user.id });
    const cachedData = !shouldForceRefresh ? getCachedData(cacheKey) : null;
    
    if (cachedData) {
      console.log('Using cached data for clientes with calculations');
      setClientes(cachedData.clientes || []);
      setPagination(cachedData.pagination || null);
      setLastSearch(currentSearch);
      return;
    }

    setLoading(true);
    try {
      console.log('Making new request to get-clientes-com-calculos with filters:', filters);
      
      const { data, error } = await supabase.functions.invoke('get-clientes-com-calculos', {
        body: {
          search: currentSearch,
          status: filters.status || 'todos',
          ordenacao: filters.ordenacao || 'cadastro_desc',
          page: filters.page || 1,
          itemsPerPage: filters.itemsPerPage || 10,
          ano: filters.ano || new Date().getFullYear()
        }
      });

      if (error) throw error;

      const result = {
        clientes: data.clientes || [],
        pagination: data.pagination || null
      };

      setClientes(result.clientes);
      setPagination(result.pagination);
      setLastSearch(currentSearch);
      
      // Cache the result
      setCachedData(cacheKey, result);
      
      console.log(`Fetched ${result.clientes.length} clients with advanced calculations (total: ${result.pagination?.total || 'unknown'})`);
    } catch (error) {
      console.error('Erro ao buscar clientes com cálculos:', error);
      setClientes([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [user, lastSearch]);

  const refreshClientes = useCallback((filters: {
    search?: string;
    status?: string;
    ordenacao?: string;
    page?: number;
    itemsPerPage?: number;
    ano?: number;
  } = {}) => {
    invalidateCache();
    return fetchClientes(filters, true);
  }, [fetchClientes]);

  return {
    clientes,
    loading,
    pagination,
    fetchClientes,
    refreshClientes
  };
};