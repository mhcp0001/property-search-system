'use client';

import { useState, useEffect } from 'react';

// APIクライアントの型定義
interface ApiClient {
  getProperties: (params?: PropertySearchParams) => Promise<Property[]>;
  getProperty: (id: number) => Promise<Property>;
  getInternetProvider: (propertyId: number) => Promise<InternetProvider | null>;
  getBikeParkings: (propertyId: number) => Promise<BikeParking[]>;
}

// 検索パラメータの型定義
interface PropertySearchParams {
  station?: string;
  min_rent?: number;
  max_rent?: number;
  floor_plan?: string;
  skip?: number;
  limit?: number;
}

// 物件の型定義
interface Property {
  id: number;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  station: string;
  walking_minutes: number;
  rent: number;
  management_fee: number | null;
  deposit: number | null;
  key_money: number | null;
  floor_plan: string;
  size_sqm: number;
  building_structure: string;
  built_year: number;
  total_floors: number | null;
  floor: number;
  corner_room: boolean;
  status: string;
  site_url: string;
  main_image_url: string | null;
  created_at: string;
  updated_at: string;
  internet_provider?: InternetProvider | null;
  bike_parkings?: BikeParking[];
}

// インターネット回線プランの型定義
interface InternetProvider {
  id: number;
  property_id: number;
  flets_plan: string | null;
  au_hikari_plan: string | null;
  nuro_plan: string | null;
  jcom_plan: string | null;
  checked_at: string;
}

// バイク駐輪場の型定義
interface BikeParking {
  id: number;
  property_id: number;
  parking_name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  distance: number | null;
  fee: string | null;
  parking_url: string;
  created_at: string;
}

// APIクライアントの実装
const createApiClient = (): ApiClient => {
  const API_BASE_URL = 'http://localhost:8000';

  return {
    // 物件一覧を取得
    getProperties: async (params?: PropertySearchParams): Promise<Property[]> => {
      try {
        const queryParams = new URLSearchParams();
        
        if (params) {
          if (params.station) queryParams.append('station', params.station);
          if (params.min_rent) queryParams.append('min_rent', params.min_rent.toString());
          if (params.max_rent) queryParams.append('max_rent', params.max_rent.toString());
          if (params.floor_plan) queryParams.append('floor_plan', params.floor_plan);
          if (params.skip) queryParams.append('skip', params.skip.toString());
          if (params.limit) queryParams.append('limit', params.limit.toString());
        }
        
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        const response = await fetch(`${API_BASE_URL}/properties/${queryString}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Failed to fetch properties:', error);
        throw error;
      }
    },
    
    // 物件詳細を取得
    getProperty: async (id: number): Promise<Property> => {
      try {
        const response = await fetch(`${API_BASE_URL}/properties/${id}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Failed to fetch property with id ${id}:`, error);
        throw error;
      }
    },
    
    // インターネット回線プラン情報を取得
    getInternetProvider: async (propertyId: number): Promise<InternetProvider | null> => {
      try {
        const response = await fetch(`${API_BASE_URL}/internet-providers/${propertyId}`);
        
        if (response.status === 404) {
          return null;
        }
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Failed to fetch internet provider for property ${propertyId}:`, error);
        throw error;
      }
    },
    
    // バイク駐輪場情報を取得
    getBikeParkings: async (propertyId: number): Promise<BikeParking[]> => {
      try {
        const response = await fetch(`${API_BASE_URL}/bike-parkings/property/${propertyId}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Failed to fetch bike parkings for property ${propertyId}:`, error);
        throw error;
      }
    }
  };
};

// APIクライアントのカスタムフック
export const useApiClient = () => {
  const [client] = useState<ApiClient>(createApiClient());
  return client;
};

// 物件検索のカスタムフック
export const usePropertySearch = (initialParams?: PropertySearchParams) => {
  const apiClient = useApiClient();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState<PropertySearchParams>(initialParams || {});

  const searchProperties = async (searchParams?: PropertySearchParams) => {
    const queryParams = searchParams || params;
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.getProperties(queryParams);
      setProperties(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchProperties();
  }, []);

  return {
    properties,
    loading,
    error,
    searchProperties,
    setParams
  };
};

// 物件詳細のカスタムフック
export const usePropertyDetail = (id: number) => {
  const apiClient = useApiClient();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPropertyDetail = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const propertyData = await apiClient.getProperty(id);
      
      // インターネット回線情報を取得
      try {
        const internetProvider = await apiClient.getInternetProvider(id);
        propertyData.internet_provider = internetProvider;
      } catch (err) {
        console.error('Failed to fetch internet provider:', err);
        propertyData.internet_provider = null;
      }
      
      // バイク駐輪場情報を取得
      try {
        const bikeParkings = await apiClient.getBikeParkings(id);
        propertyData.bike_parkings = bikeParkings;
      } catch (err) {
        console.error('Failed to fetch bike parkings:', err);
        propertyData.bike_parkings = [];
      }
      
      setProperty(propertyData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPropertyDetail();
    }
  }, [id]);

  return {
    property,
    loading,
    error,
    refetch: fetchPropertyDetail
  };
};
