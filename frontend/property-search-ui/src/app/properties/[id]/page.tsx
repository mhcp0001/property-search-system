'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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
  internet_provider: InternetProvider | null;
  bike_parkings: BikeParking[];
}

interface InternetProvider {
  id: number;
  property_id: number;
  flets_plan: string | null;
  au_hikari_plan: string | null;
  nuro_plan: string | null;
  jcom_plan: string | null;
  checked_at: string;
}

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

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPropertyDetail = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/properties/${id}`);
        
        if (!response.ok) {
          throw new Error('物件詳細の取得に失敗しました');
        }
        
        const data = await response.json();
        setProperty(data);
        setError(null);
      } catch (err) {
        setError('物件詳細の取得中にエラーが発生しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPropertyDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || '物件が見つかりませんでした'}
        </div>
        <div className="mt-4">
          <Link href="/properties" className="text-blue-600 hover:underline">
            ← 物件一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/properties" className="text-blue-600 hover:underline">
          ← 物件一覧に戻る
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* 物件ヘッダー */}
        <div className="p-6 border-b">
          <h1 className="text-3xl font-bold mb-2">{property.name}</h1>
          <p className="text-gray-600">{property.address}</p>
        </div>

        {/* 物件画像と基本情報 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* 物件画像 */}
          <div>
            {property.main_image_url ? (
              <img
                src={property.main_image_url}
                alt={property.name}
                className="w-full h-auto rounded-lg"
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg">
                <span className="text-gray-400">画像なし</span>
              </div>
            )}
          </div>

          {/* 基本情報 */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-blue-600 mb-2">
                {property.rent.toLocaleString()} 円
                {property.management_fee && (
                  <span className="text-sm text-gray-500 ml-2">
                    (管理費: {property.management_fee.toLocaleString()} 円)
                  </span>
                )}
              </h2>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-gray-600">敷金</p>
                  <p className="font-semibold">
                    {property.deposit ? `${property.deposit.toLocaleString()} 円` : '無し'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">礼金</p>
                  <p className="font-semibold">
                    {property.key_money ? `${property.key_money.toLocaleString()} 円` : '無し'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">間取り</p>
                <p className="font-semibold">{property.floor_plan}</p>
              </div>
              <div>
                <p className="text-gray-600">専有面積</p>
                <p className="font-semibold">{property.size_sqm} m²</p>
              </div>
              <div>
                <p className="text-gray-600">最寄り駅</p>
                <p className="font-semibold">{property.station} 駅 (徒歩 {property.walking_minutes} 分)</p>
              </div>
              <div>
                <p className="text-gray-600">築年数</p>
                <p className="font-semibold">{new Date().getFullYear() - property.built_year} 年 ({property.built_year} 年築)</p>
              </div>
              <div>
                <p className="text-gray-600">階数</p>
                <p className="font-semibold">{property.floor} 階 {property.total_floors && `/ ${property.total_floors} 階建`}</p>
              </div>
              <div>
                <p className="text-gray-600">角部屋</p>
                <p className="font-semibold">{property.corner_room ? 'はい' : 'いいえ'}</p>
              </div>
              <div>
                <p className="text-gray-600">建物構造</p>
                <p className="font-semibold">{property.building_structure}</p>
              </div>
            </div>

            {property.latitude && property.longitude && (
              <div className="mt-6">
                <a
                  href={`https://maps.google.com/?q=${property.latitude},${property.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700"
                >
                  Google マップで見る
                </a>
              </div>
            )}
          </div>
        </div>

        {/* インターネット回線情報 */}
        <div className="p-6 border-t">
          <h2 className="text-xl font-bold mb-4">インターネット回線情報</h2>
          {property.internet_provider ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">フレッツ光</h3>
                <p>{property.internet_provider.flets_plan || '情報なし'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">auひかり</h3>
                <p>{property.internet_provider.au_hikari_plan || '情報なし'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">NURO光</h3>
                <p>{property.internet_provider.nuro_plan || '情報なし'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">J:COM</h3>
                <p>{property.internet_provider.jcom_plan || '情報なし'}</p>
              </div>
              <div className="col-span-2 text-sm text-gray-500">
                最終確認日: {new Date(property.internet_provider.checked_at).toLocaleDateString()}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">インターネット回線情報はありません</p>
          )}
        </div>

        {/* バイク駐輪場情報 */}
        <div className="p-6 border-t">
          <h2 className="text-xl font-bold mb-4">近隣バイク駐輪場</h2>
          {property.bike_parkings && property.bike_parkings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">駐輪場名</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">住所</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">距離</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">料金</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">詳細</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {property.bike_parkings.map((parking) => (
                    <tr key={parking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{parking.parking_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{parking.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {parking.distance ? `${parking.distance.toFixed(2)} km` : '不明'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{parking.fee || '不明'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={parking.parking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          詳細を見る
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">近隣のバイク駐輪場情報はありません</p>
          )}
        </div>

        {/* 物件元サイトリンク */}
        <div className="p-6 border-t">
          <a
            href={property.site_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
          >
            物件元サイトで詳細を見る
          </a>
        </div>
      </div>
    </div>
  );
}
