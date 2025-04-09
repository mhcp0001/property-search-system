'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface Property {
  id: number;
  name: string;
  address: string;
  station: string;
  walking_minutes: number;
  rent: number;
  management_fee: number | null;
  floor_plan: string;
  size_sqm: number;
  built_year: number;
  floor: number;
  corner_room: boolean;
  main_image_url: string | null;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [station, setStation] = useState('');
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [floorPlan, setFloorPlan] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // URLパラメータから検索条件を取得
    const stationParam = searchParams.get('station') || '';
    const minRentParam = searchParams.get('min_rent') || '';
    const maxRentParam = searchParams.get('max_rent') || '';
    const floorPlanParam = searchParams.get('floor_plan') || '';
    
    setStation(stationParam);
    setMinRent(minRentParam);
    setMaxRent(maxRentParam);
    setFloorPlan(floorPlanParam);
    
    fetchProperties(stationParam, minRentParam, maxRentParam, floorPlanParam);
  }, [searchParams]);

  const fetchProperties = async (
    station: string, 
    minRent: string, 
    maxRent: string, 
    floorPlan: string
  ) => {
    setLoading(true);
    try {
      // クエリパラメータの構築
      const params = new URLSearchParams();
      if (station) params.append('station', station);
      if (minRent) params.append('min_rent', minRent);
      if (maxRent) params.append('max_rent', maxRent);
      if (floorPlan) params.append('floor_plan', floorPlan);
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`http://localhost:8000/properties/${queryString}`);
      
      if (!response.ok) {
        throw new Error('物件データの取得に失敗しました');
      }
      
      const data = await response.json();
      setProperties(data);
      setError(null);
    } catch (err) {
      setError('物件データの取得中にエラーが発生しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 検索パラメータの構築
    const params = new URLSearchParams();
    if (station) params.append('station', station);
    if (minRent) params.append('min_rent', minRent);
    if (maxRent) params.append('max_rent', maxRent);
    if (floorPlan) params.append('floor_plan', floorPlan);
    
    // URLを更新して検索を実行
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">物件検索</h1>
      
      {/* 検索フォーム */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="station" className="block text-sm font-medium text-gray-700 mb-1">
                最寄り駅
              </label>
              <input
                type="text"
                id="station"
                value={station}
                onChange={(e) => setStation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="駅名"
              />
            </div>
            
            <div>
              <label htmlFor="minRent" className="block text-sm font-medium text-gray-700 mb-1">
                最低家賃 (円)
              </label>
              <input
                type="number"
                id="minRent"
                value={minRent}
                onChange={(e) => setMinRent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="最低家賃"
              />
            </div>
            
            <div>
              <label htmlFor="maxRent" className="block text-sm font-medium text-gray-700 mb-1">
                最高家賃 (円)
              </label>
              <input
                type="number"
                id="maxRent"
                value={maxRent}
                onChange={(e) => setMaxRent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="最高家賃"
              />
            </div>
            
            <div>
              <label htmlFor="floorPlan" className="block text-sm font-medium text-gray-700 mb-1">
                間取り
              </label>
              <select
                id="floorPlan"
                value={floorPlan}
                onChange={(e) => setFloorPlan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">すべて</option>
                <option value="1K">1K</option>
                <option value="1DK">1DK</option>
                <option value="1LDK">1LDK</option>
                <option value="2K">2K</option>
                <option value="2DK">2DK</option>
                <option value="2LDK">2LDK</option>
                <option value="3K">3K</option>
                <option value="3DK">3DK</option>
                <option value="3LDK">3LDK</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
            >
              検索
            </button>
          </div>
        </form>
      </div>
      
      {/* 物件一覧 */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">条件に一致する物件が見つかりませんでした。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Link href={`/properties/${property.id}`} key={property.id}>
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {property.main_image_url ? (
                  <img
                    src={property.main_image_url}
                    alt={property.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">画像なし</span>
                  </div>
                )}
                
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2 truncate">{property.name}</h2>
                  
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">{property.station} 駅</span>
                    <span className="text-gray-600">徒歩 {property.walking_minutes} 分</span>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">{property.floor_plan}</span>
                    <span className="text-gray-600">{property.size_sqm} m²</span>
                  </div>
                  
                  <div className="mt-2">
                    <span className="text-xl font-bold text-blue-600">
                      {property.rent.toLocaleString()} 円
                    </span>
                    {property.management_fee && (
                      <span className="text-sm text-gray-500 ml-2">
                        (管理費: {property.management_fee.toLocaleString()} 円)
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-500 mt-2 truncate">{property.address}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
