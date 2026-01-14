import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getBatches, getMedicines, stockIn, stockOut } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Plus, Minus, Search, AlertTriangle } from 'lucide-react';
import { formatDate, isExpiringSoon, isExpired } from '../lib/utils';

export default function Inventory() {
  const { user } = useContext(AuthContext);
  const [batches, setBatches] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stockInDialog, setStockInDialog] = useState(false);
  const [stockOutDialog, setStockOutDialog] = useState(false);
  const [stockInForm, setStockInForm] = useState({
    medicine: '',
    batchNumber: '',
    quantity: '',
    expiryDate: '',
  });
  const [stockOutForm, setStockOutForm] = useState({
    medicine: '',
    quantity: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = batches.filter(batch =>
      batch.medicine?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBatches(filtered);
  }, [searchTerm, batches]);

  const fetchData = async () => {
    try {
      const [batchesRes, medicinesRes] = await Promise.all([
        getBatches(),
        getMedicines()
      ]);
      setBatches(batchesRes.data.batches || []);
      setMedicines(medicinesRes.data.medicines || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStockIn = async (e) => {
    e.preventDefault();
    try {
      await stockIn(stockInForm);
      fetchData();
      setStockInDialog(false);
      setStockInForm({
        medicine: '',
        batchNumber: '',
        quantity: '',
        expiryDate: '',
      });
    } catch (error) {
      console.error('Error adding stock:', error);
      alert(error.response?.data?.message || 'Failed to add stock');
    }
  };

  const handleStockOut = async (e) => {
    e.preventDefault();
    try {
      await stockOut(stockOutForm);
      fetchData();
      setStockOutDialog(false);
      setStockOutForm({
        medicine: '',
        quantity: '',
      });
    } catch (error) {
      console.error('Error issuing stock:', error);
      alert(error.response?.data?.message || 'Failed to issue stock');
    }
  };

  const getBatchStatus = (batch) => {
    if (isExpired(batch.expiryDate)) {
      return { text: 'Expired', color: 'text-red-600 bg-red-50' };
    }
    if (isExpiringSoon(batch.expiryDate)) {
      return { text: 'Expiring Soon', color: 'text-orange-600 bg-orange-50' };
    }
    if (batch.quantity < (batch.medicine?.minStockLevel || 10)) {
      return { text: 'Low Stock', color: 'text-yellow-600 bg-yellow-50' };
    }
    return { text: 'Good', color: 'text-green-600 bg-green-50' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage stock levels and batches</p>
        </div>
        <div className="flex space-x-2">
          {user?.role === 'PHARMACIST' && (
            <Button onClick={() => setStockInDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Stock In
            </Button>
          )}
          {(user?.role === 'PHARMACIST' || user?.role === 'STAFF') && (
            <Button variant="outline" onClick={() => setStockOutDialog(true)}>
              <Minus className="w-4 h-4 mr-2" />
              Stock Out
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search batches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medicine</TableHead>
                <TableHead>Batch Number</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No batches found
                  </TableCell>
                </TableRow>
              ) : (
                filteredBatches.map((batch) => {
                  const status = getBatchStatus(batch);
                  return (
                    <TableRow key={batch._id}>
                      <TableCell className="font-medium">{batch.medicine?.name}</TableCell>
                      <TableCell>{batch.batchNumber}</TableCell>
                      <TableCell>{batch.quantity}</TableCell>
                      <TableCell>{formatDate(batch.expiryDate)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          {status.text}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Stock In Dialog */}
      <Dialog open={stockInDialog} onOpenChange={setStockInDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Stock</DialogTitle>
            <DialogDescription>Add new batch to inventory</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStockIn}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="medicine">Medicine *</Label>
                <select
                  id="medicine"
                  value={stockInForm.medicine}
                  onChange={(e) => setStockInForm({ ...stockInForm, medicine: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                  required
                >
                  <option value="">Select medicine</option>
                  {medicines.map((med) => (
                    <option key={med._id} value={med._id}>
                      {med.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="batchNumber">Batch Number *</Label>
                <Input
                  id="batchNumber"
                  value={stockInForm.batchNumber}
                  onChange={(e) => setStockInForm({ ...stockInForm, batchNumber: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={stockInForm.quantity}
                  onChange={(e) => setStockInForm({ ...stockInForm, quantity: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={stockInForm.expiryDate}
                  onChange={(e) => setStockInForm({ ...stockInForm, expiryDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStockInDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Stock</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stock Out Dialog */}
      <Dialog open={stockOutDialog} onOpenChange={setStockOutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Stock</DialogTitle>
            <DialogDescription>Remove stock from inventory (FEFO)</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStockOut}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="medicineOut">Medicine *</Label>
                <select
                  id="medicineOut"
                  value={stockOutForm.medicine}
                  onChange={(e) => setStockOutForm({ ...stockOutForm, medicine: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                  required
                >
                  <option value="">Select medicine</option>
                  {medicines.map((med) => (
                    <option key={med._id} value={med._id}>
                      {med.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantityOut">Quantity *</Label>
                <Input
                  id="quantityOut"
                  type="number"
                  value={stockOutForm.quantity}
                  onChange={(e) => setStockOutForm({ ...stockOutForm, quantity: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-start space-x-2 text-sm text-muted-foreground">
                <AlertTriangle className="w-4 h-4 mt-0.5" />
                <p>Stock will be issued from batches with earliest expiry date (FEFO)</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStockOutDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Issue Stock</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}