import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import PropertiesPage from '../src/app/properties/page';

// モックの設定
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => ({
    get: jest.fn().mockImplementation(param => {
      if (param === 'station') return '';
      if (param === 'min_rent') return '';
      if (param === 'max_rent') return '';
      if (param === 'floor_plan') return '';
      return null;
    })
  }))
}));

// fetchのモック
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      {
        id: 1,
        name: 'テスト物件',
        address: '東京都新宿区1-1-1',
        station: '新宿',
        walking_minutes: 5,
        rent: 100000,
        management_fee: 5000,
        floor_plan: '1LDK',
        size_sqm: 40.5,
        built_year: 2015,
        floor: 3,
        corner_room: true,
        main_image_url: null
      }
    ])
  })
);

const mockRouter = {
  push: jest.fn()
};

describe('PropertiesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  test('物件一覧が正しく表示される', async () => {
    render(<PropertiesPage />);
    
    // ローディング状態が表示される
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // データが読み込まれるのを待つ
    await waitFor(() => {
      expect(screen.getByText('テスト物件')).toBeInTheDocument();
    });
    
    // 物件情報が表示される
    expect(screen.getByText('新宿 駅')).toBeInTheDocument();
    expect(screen.getByText('徒歩 5 分')).toBeInTheDocument();
    expect(screen.getByText('1LDK')).toBeInTheDocument();
    expect(screen.getByText('100,000 円')).toBeInTheDocument();
  });

  test('検索フォームが正しく動作する', async () => {
    render(<PropertiesPage />);
    
    // データが読み込まれるのを待つ
    await waitFor(() => {
      expect(screen.getByText('テスト物件')).toBeInTheDocument();
    });
    
    // 検索フォームに入力
    const stationInput = screen.getByLabelText('最寄り駅');
    const minRentInput = screen.getByLabelText('最低家賃 (円)');
    const maxRentInput = screen.getByLabelText('最高家賃 (円)');
    const floorPlanSelect = screen.getByLabelText('間取り');
    
    await userEvent.type(stationInput, '新宿');
    await userEvent.type(minRentInput, '50000');
    await userEvent.type(maxRentInput, '150000');
    await userEvent.selectOptions(floorPlanSelect, '1LDK');
    
    // 検索ボタンをクリック
    const searchButton = screen.getByRole('button', { name: '検索' });
    await userEvent.click(searchButton);
    
    // ルーターのpushが正しいパラメータで呼ばれる
    expect(mockRouter.push).toHaveBeenCalledWith(
      '/properties?station=新宿&min_rent=50000&max_rent=150000&floor_plan=1LDK'
    );
  });

  test('エラー状態が正しく表示される', async () => {
    // fetchのモックをエラーに設定
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500
      })
    );
    
    render(<PropertiesPage />);
    
    // エラーメッセージが表示される
    await waitFor(() => {
      expect(screen.getByText('物件データの取得中にエラーが発生しました')).toBeInTheDocument();
    });
  });
});
