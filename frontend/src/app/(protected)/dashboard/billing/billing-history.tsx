'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

const invoices: Invoice[] = [
  { id: '1234', date: '2024-03-12', amount: '$29.00', status: 'Paid' },
  { id: '1233', date: '2024-02-10', amount: '$29.00', status: 'Paid' },
  { id: '1232', date: '2024-01-08', amount: '$29.00', status: 'Pending' },
  { id: '1231', date: '2023-12-15', amount: '$29.00', status: 'Paid' },
  { id: '1230', date: '2023-11-20', amount: '$29.00', status: 'Paid' },
  { id: '1229', date: '2023-10-18', amount: '$29.00', status: 'Paid' },
  { id: '1228', date: '2023-09-25', amount: '$29.00', status: 'Paid' },
  { id: '1227', date: '2023-08-30', amount: '$29.00', status: 'Paid' },
];

const statusStyles = {
  Paid: 'bg-green-50 text-green-700 border-green-200',
  Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Overdue: 'bg-red-50 text-red-700 border-red-200',
} as const;

export function BillingHistory() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const currentInvoices = invoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <Card className="relative opacity-60">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Billing History
          <span className="text-secondary-foreground rounded px-2 py-1 text-xs">Soon</span>
        </CardTitle>
        <CardDescription>View your past invoices and payments.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">#{invoice.id}</TableCell>
                <TableCell>
                  {new Date(invoice.date).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell className="font-medium">{invoice.amount}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(statusStyles[invoice.status])}>
                    {invoice.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-6">
          <Pagination className="pointer-events-none justify-start opacity-50">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious className="pointer-events-none opacity-50" />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink isActive={currentPage === page} className="pointer-events-none">
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext className="pointer-events-none opacity-50" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
}
