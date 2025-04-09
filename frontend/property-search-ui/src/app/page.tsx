'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6">物件検索システム</h1>
        <p className="text-xl text-gray-600 mb-8">
          お好みの条件で物件を検索し、インターネット回線プランやバイク駐輪場情報を確認できます。
        </p>
        
        <Link 
          href="/properties" 
          className="inline-block px-8 py-3 bg-blue-600 text-white font-medium rounded-lg text-lg hover:bg-blue-700 transition-colors"
        >
          物件を検索する
        </Link>
      </div>
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">物件情報</h2>
          <p className="text-gray-600 mb-4">
            家賃、間取り、最寄り駅などの詳細な物件情報を確認できます。
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">インターネット回線</h2>
          <p className="text-gray-600 mb-4">
            フレッツ光、auひかり、NURO光、J:COMなどの回線プラン情報を確認できます。
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">バイク駐輪場</h2>
          <p className="text-gray-600 mb-4">
            物件周辺のバイク駐輪場情報と物件からの距離を確認できます。
          </p>
        </div>
      </div>
    </div>
  );
}
