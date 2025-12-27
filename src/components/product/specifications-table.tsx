'use client';

import { Specification } from '@/types';

interface SpecificationsTableProps {
  /** Array of key-value specification pairs */
  specifications: Specification[] | null | undefined;
  /** Optional className for styling */
  className?: string;
}

/**
 * Specifications Table Component
 * 
 * Displays product specifications in a clean table format.
 * Alternating row backgrounds for better readability.
 * Returns null if no specifications provided.
 * 
 * @example
 * <SpecificationsTable 
 *   specifications={[
 *     { key: 'Material', value: '100% Cotton' },
 *     { key: 'Weight', value: '250 GSM' },
 *   ]} 
 * />
 */
const SpecificationsTable: React.FC<SpecificationsTableProps> = ({ 
  specifications,
  className = '' 
}) => {
  // Don't render if no specifications
  if (!specifications || specifications.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Specifications
      </h3>
      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <tbody>
            {specifications.map((spec, index) => (
              <tr 
                key={`${spec.key}-${index}`}
                className={`
                  ${index % 2 === 0 ? 'bg-muted/30' : 'bg-background'}
                  ${index < specifications.length - 1 ? 'border-b border-border/50' : ''}
                `}
              >
                {/* Key column */}
                <td className="px-4 py-3 text-sm font-medium text-muted-foreground w-1/3 sm:w-2/5">
                  {spec.key}
                </td>
                {/* Value column */}
                <td className="px-4 py-3 text-sm text-foreground">
                  {spec.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SpecificationsTable;
