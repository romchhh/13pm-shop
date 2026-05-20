import React, { type ReactNode } from "react";

interface TableProps {
  children: ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
}

interface TableCellProps {
  children?: ReactNode;
  isHeader?: boolean;
  className?: string;
  colSpan?: number;
}

export const Table: React.FC<TableProps> = ({ children, className = "" }) => (
  <table className={`min-w-full ${className}`.trim()}>{children}</table>
);

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className = "" }) => (
  <thead className={className}>{children}</thead>
);

export const TableBody: React.FC<TableBodyProps> = ({ children, className = "" }) => (
  <tbody className={className}>{children}</tbody>
);

export const TableRow: React.FC<TableRowProps> = ({ children, className = "" }) => (
  <tr className={className}>{children}</tr>
);

export const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  className = "",
  colSpan,
}) => {
  const CellTag = isHeader ? "th" : "td";
  return (
    <CellTag colSpan={colSpan} className={className}>
      {children}
    </CellTag>
  );
};
