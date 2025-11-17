import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, History, Eye } from 'lucide-react';
import { HighlightText } from '@/components/ui/highlight-text';
import type { Quilt } from '@/types/quilt';
import { useLanguage } from '@/lib/language-provider';

interface QuiltTableRowProps {
  quilt: Quilt;
  searchTerm: string;
  isSelectMode: boolean;
  isSelected: boolean;
  onSelectToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: () => void;
  onViewHistory: () => void;
  onDoubleClick?: () => void;
}

export function QuiltTableRow({
  quilt,
  searchTerm,
  isSelectMode,
  isSelected,
  onSelectToggle,
  onEdit,
  onDelete,
  onStatusChange,
  onViewHistory,
  onDoubleClick,
}: QuiltTableRowProps) {
  const { t, language } = useLanguage();

  const getSeasonColor = (season: string) => {
    switch (season) {
      case 'WINTER':
        return 'bg-blue-100 text-blue-800';
      case 'SUMMER':
        return 'bg-orange-100 text-orange-800';
      case 'SPRING_AUTUMN':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_USE':
        return 'bg-green-100 text-green-800';
      case 'AVAILABLE':
        return 'bg-blue-100 text-blue-800';
      case 'STORAGE':
        return 'bg-gray-100 text-gray-800';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <tr
      className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
      onDoubleClick={onDoubleClick}
      title={
        onDoubleClick
          ? language === 'zh'
            ? '双击执行操作'
            : 'Double-click to perform action'
          : undefined
      }
    >
      {isSelectMode && (
        <td className="p-4 align-middle">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelectToggle}
            className="w-4 h-4 rounded border-gray-300"
          />
        </td>
      )}
      <td className="p-4 align-middle text-center font-medium">#{quilt.itemNumber}</td>
      <td className="p-4 align-middle text-center">
        <HighlightText text={quilt.name} searchTerm={searchTerm} />
      </td>
      <td className="p-4 align-middle text-center">
        <Badge variant="outline" className={getSeasonColor(quilt.season)}>
          {t(`season.${quilt.season}`)}
        </Badge>
      </td>
      <td className="p-4 align-middle text-center text-sm text-muted-foreground">
        {quilt.lengthCm && quilt.widthCm
          ? `${quilt.lengthCm}×${quilt.widthCm}cm`
          : quilt.size || '-'}
      </td>
      <td className="p-4 align-middle text-center text-sm text-muted-foreground">
        {quilt.weightGrams}g
      </td>
      <td className="p-4 align-middle text-center text-sm text-muted-foreground">
        {quilt.fillMaterial}
      </td>
      <td className="p-4 align-middle text-center text-sm text-muted-foreground">{quilt.color}</td>
      <td className="p-4 align-middle text-center text-sm text-muted-foreground">
        {quilt.location}
      </td>
      <td className="p-4 align-middle text-center">
        <Badge className={getStatusColor(quilt.currentStatus)}>
          {t(`status.${quilt.currentStatus}`)}
        </Badge>
      </td>
      <td className="p-4 align-middle text-center">
        <div className="flex items-center justify-center gap-1">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onStatusChange}>
            <History className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onViewHistory}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
