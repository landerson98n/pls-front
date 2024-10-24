import { TableCell, TableRow } from "@/components/ui/table"

interface SkeletonTableRowProps {
    columns?: number
}

export default function SkeletonTableRow({ columns = 4 }: SkeletonTableRowProps) {
    return (
        <TableRow className="animate-pulse">
            {[...Array(columns)].map((_, index) => (
                <TableCell key={index} className="p-4">
                    <div className="h-4 bg-gray-200 rounded-md dark:bg-gray-700">
                        <div className="h-4 bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600 shimmer-effect"></div>
                    </div>
                </TableCell>
            ))}
        </TableRow>
    )
}