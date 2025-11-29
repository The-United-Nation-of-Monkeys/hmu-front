import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslation } from 'react-i18next'

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  isLoading?: boolean
  onRowClick?: (item: T) => void
}

export function DataTable<T extends { id: number }>({
  data,
  columns,
  isLoading = false,
  onRowClick,
}: DataTableProps<T>) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {t('noData')}
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={String(column.key)}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow
            key={item.id}
            onClick={() => onRowClick?.(item)}
            className={onRowClick ? 'cursor-pointer' : ''}
          >
            {columns.map((column) => (
              <TableCell key={String(column.key)}>
                {column.render
                  ? column.render(item)
                  : String(item[column.key as keyof T] ?? '')}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

