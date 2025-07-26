
/**
 * Utilitários para validação e normalização de dados de importação
 */

// Função para calcular distância de Levenshtein (busca fuzzy)
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Função para calcular similaridade entre strings
function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1 - distance / maxLength;
}

export interface SimilarItem {
  id: string;
  nome: string;
  similarity: number;
}

export interface ValidationResult {
  exists: boolean;
  exactMatch?: any;
  similarItems: SimilarItem[];
}

// Função para encontrar itens similares
export function findSimilarItems(
  searchTerm: string,
  existingItems: { id: string; nome: string }[],
  threshold = 0.7
): ValidationResult {
  if (!searchTerm || !searchTerm.trim()) {
    return { exists: false, similarItems: [] };
  }
  
  const normalizedSearch = searchTerm.trim().toLowerCase();
  
  // Verificar correspondência exata
  const exactMatch = existingItems.find(
    item => item.nome.toLowerCase() === normalizedSearch
  );
  
  if (exactMatch) {
    return { exists: true, exactMatch, similarItems: [] };
  }
  
  // Encontrar itens similares
  const similarItems = existingItems
    .map(item => ({
      ...item,
      similarity: calculateSimilarity(normalizedSearch, item.nome)
    }))
    .filter(item => item.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3); // Máximo 3 sugestões
  
  return { exists: false, similarItems };
}

// Normalizar nome para evitar duplicatas
export function normalizeName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ') // Múltiplos espaços para um
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export interface MissingDataItem {
  type: 'servidor' | 'aplicativo' | 'dispositivo';
  originalName: string;
  normalizedName: string;
  suggestedItems: SimilarItem[];
  action: 'create' | 'use_existing' | 'skip';
  selectedExisting?: string;
}

// Validar dados de importação
export function validateImportData(
  clientData: any,
  existingData: {
    servidores: { id: string; nome: string }[];
    aplicativos: { id: string; nome: string }[];
    dispositivos: { id: string; nome: string }[];
  }
): MissingDataItem[] {
  const missingItems: MissingDataItem[] = [];
  
  // Validar servidor
  if (clientData.servidor) {
    const serverValidation = findSimilarItems(clientData.servidor, existingData.servidores);
    if (!serverValidation.exists) {
      missingItems.push({
        type: 'servidor',
        originalName: clientData.servidor,
        normalizedName: normalizeName(clientData.servidor),
        suggestedItems: serverValidation.similarItems,
        action: 'create'
      });
    }
  }
  
  // Validar aplicativo principal
  if (clientData.aplicativo) {
    const appValidation = findSimilarItems(clientData.aplicativo, existingData.aplicativos);
    if (!appValidation.exists) {
      missingItems.push({
        type: 'aplicativo',
        originalName: clientData.aplicativo,
        normalizedName: normalizeName(clientData.aplicativo),
        suggestedItems: appValidation.similarItems,
        action: 'create'
      });
    }
  }
  
  // Validar aplicativo secundário
  if (clientData.aplicativo_2) {
    const app2Validation = findSimilarItems(clientData.aplicativo_2, existingData.aplicativos);
    if (!app2Validation.exists) {
      const existingItem = missingItems.find(
        item => item.type === 'aplicativo' && item.originalName === clientData.aplicativo_2
      );
      
      if (!existingItem) {
        missingItems.push({
          type: 'aplicativo',
          originalName: clientData.aplicativo_2,
          normalizedName: normalizeName(clientData.aplicativo_2),
          suggestedItems: app2Validation.similarItems,
          action: 'create'
        });
      }
    }
  }
  
  // Validar dispositivo principal
  if (clientData.dispositivo_smart) {
    const deviceValidation = findSimilarItems(clientData.dispositivo_smart, existingData.dispositivos);
    if (!deviceValidation.exists) {
      missingItems.push({
        type: 'dispositivo',
        originalName: clientData.dispositivo_smart,
        normalizedName: normalizeName(clientData.dispositivo_smart),
        suggestedItems: deviceValidation.similarItems,
        action: 'create'
      });
    }
  }
  
  // Validar dispositivo secundário
  if (clientData.dispositivo_smart_2) {
    const device2Validation = findSimilarItems(clientData.dispositivo_smart_2, existingData.dispositivos);
    if (!device2Validation.exists) {
      const existingItem = missingItems.find(
        item => item.type === 'dispositivo' && item.originalName === clientData.dispositivo_smart_2
      );
      
      if (!existingItem) {
        missingItems.push({
          type: 'dispositivo',
          originalName: clientData.dispositivo_smart_2,
          normalizedName: normalizeName(clientData.dispositivo_smart_2),
          suggestedItems: device2Validation.similarItems,
          action: 'create'
        });
      }
    }
  }
  
  return missingItems;
}
