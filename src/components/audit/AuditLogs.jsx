import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export default function AuditLogs({ logs }) {
  const getTypeColor = (type) => {
    switch (type) {
      case 'STOCK_IN':
        return 'text-green-600 bg-green-50';
      case 'STOCK_OUT':
        return 'text-blue-600 bg-blue-50';
      case 'EXPIRED':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No audit logs found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date & Time</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Medicine</TableHead>
          <TableHead>Batch</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Performed By</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log._id}>
            <TableCell>
              {new Date(log.createdAt).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(log.type)}`}>
                {log.type.replace('_', ' ')}
              </span>
            </TableCell>
            <TableCell className="font-medium">{log.medicine?.name}</TableCell>
            <TableCell>{log.batch?.batchNumber}</TableCell>
            <TableCell>{log.quantity}</TableCell>
            <TableCell>
              <div>
                <p className="font-medium">{log.performedBy?.name}</p>
                <p className="text-xs text-muted-foreground">{log.performedBy?.role}</p>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}