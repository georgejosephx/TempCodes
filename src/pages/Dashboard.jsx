import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getBatches } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Package, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import { formatDate, isExpiringSoon } from '../lib/utils';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStock: 0,
    expiringSoon: 0,
    totalValue: 0,
  });
  const [expiringBatches, setExpiringBatches] = useState([]);
  const [lowStockBatches, setLowStockBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const batchesRes = await getBatches();
      const batches = batchesRes.data.batches || [];
      
      // Calculate stats
      const uniqueMedicines = new Set(batches.map(b => b.medicine?._id)).size;
      const lowStockBatches = batches.filter(b => b.quantity < (b.medicine?.minStockLevel || 10));
      const expiringSoonBatches = batches.filter(b => isExpiringSoon(b.expiryDate));

      setStats({
        totalMedicines: uniqueMedicines,
        lowStock: lowStockBatches.length,
        expiringSoon: expiringSoonBatches.length,
        totalValue: batches.reduce((sum, b) => sum + (b.quantity * (b.medicine?.price || 0)), 0),
      });

      // Sort and get top 5 expiring batches
      const sortedExpiring = [...expiringSoonBatches].sort((a, b) => 
        new Date(a.expiryDate) - new Date(b.expiryDate)
      );
      setExpiringBatches(sortedExpiring.slice(0, 5));

      // Get low stock batches
      setLowStockBatches(lowStockBatches.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your inventory today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Medicines</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMedicines}</div>
            <p className="text-xs text-muted-foreground">Active in inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">Items below minimum level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiringSoon}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current inventory value</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Expiring Soon */}
        {expiringBatches.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-red-500" />
                Expiring Soon
              </CardTitle>
              <CardDescription>Batches expiring within the next 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expiringBatches.map((batch) => {
                  const daysLeft = Math.ceil(
                    (new Date(batch.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div 
                      key={batch._id} 
                      className="flex items-center justify-between p-3 border rounded-lg bg-red-50 border-red-200"
                    >
                      <div>
                        <p className="font-medium text-sm">{batch.medicine?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Batch: {batch.batchNumber} • Qty: {batch.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-600">
                          {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(batch.expiryDate)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Low Stock */}
        {lowStockBatches.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                Low Stock
              </CardTitle>
              <CardDescription>Items below minimum stock level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockBatches.map((batch) => (
                  <div 
                    key={batch._id} 
                    className="flex items-center justify-between p-3 border rounded-lg bg-orange-50 border-orange-200"
                  >
                    <div>
                      <p className="font-medium text-sm">{batch.medicine?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Batch: {batch.batchNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-600">
                        {batch.quantity} left
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Min: {batch.medicine?.minStockLevel || 10}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions Info */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks based on your role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {user?.role === 'ADMIN' && (
              <>
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h4 className="font-medium mb-1">View Reports</h4>
                  <p className="text-xs text-muted-foreground">Check usage and wastage analytics</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h4 className="font-medium mb-1">Manage Users</h4>
                  <p className="text-xs text-muted-foreground">Add or edit system users</p>
                </div>
              </>
            )}
            {(user?.role === 'ADMIN' || user?.role === 'PHARMACIST') && (
              <>
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h4 className="font-medium mb-1">Add Stock</h4>
                  <p className="text-xs text-muted-foreground">Record new medicine batches</p>
                </div>
                <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h4 className="font-medium mb-1">Add Medicine</h4>
                  <p className="text-xs text-muted-foreground">Register new medicine types</p>
                </div>
              </>
            )}
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <h4 className="font-medium mb-1">Issue Stock</h4>
              <p className="text-xs text-muted-foreground">Dispense medicines (FEFO)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}