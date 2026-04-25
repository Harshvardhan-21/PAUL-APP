import { ProductScreen as ElectricianProductScreen } from '../electrician/ProductScreen';
import type { Screen } from '@/shared/types/navigation';

export function ProductScreen({
  onNavigate,
  initialCategory,
}: {
  onNavigate: (screen: Screen) => void;
  initialCategory?: string;
}) {
  const handleNavigate = (screen: Screen) => {
    onNavigate(screen === 'scan' ? 'electricians' : screen);
  };

  return (
    <ElectricianProductScreen
      onNavigate={handleNavigate}
      initialCategory={initialCategory}
      showBottomBanner={false}
      showScanButton={false}
    />
  );
}
