import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Pencil, Trash2 } from 'lucide-react';

export default function MedicineList({ medicines, onEdit, onDelete }) {
  if (medicines.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No medicines found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Generic Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Manufacturer</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Min Stock</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {medicines.map((medicine) => (
          <TableRow key={medicine._id}>
            <TableCell className="font-medium">{medicine.name}</TableCell>
            <TableCell>{medicine.genericName}</TableCell>
            <TableCell>{medicine.category}</TableCell>
            <TableCell>{medicine.manufacturer}</TableCell>
            <TableCell>₹{medicine.price}</TableCell>
            <TableCell>{medicine.minStockLevel}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" onClick={() => onEdit(medicine)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(medicine._id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}