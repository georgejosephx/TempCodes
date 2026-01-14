import React, { useState, useEffect } from 'react';
import { getMonthlyUsage, getTopConsumed, getExpiredWastage } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText, TrendingUp, AlertCircle } from 'lucide-react';

export default function Reports() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [topConsumed, setTopConsumed] = useState([]);
  const [expiredWastage, setExpiredWastage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('monthly');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const currentDate = new Date();
      const [monthlyRes, topRes, expiredRes] = await Promise.all([
        getMonthlyUsage({ 
          month: currentDate.getMonth() + 1, 
          year: currentDate.getFullYear() 
        }),
        getTopConsumed({ limit: 10 }),
        getExpiredWastage({ 
          startDate: new Date(currentDate.getFullYear(), 0, 1).toISOString(),
          endDate: currentDate.toISOString()
        })
      ]);

      setMonthlyData(monthlyRes.data.usage || []);
      setTopConsumed(topRes.data.medicines || []);
      setExpiredWastage(expiredRes.data.wastage || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
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
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Analyze inventory usage and trends</p>
      </div>

      <div className="flex space-x-2 border-b">
        <Button
          variant={activeTab === 'monthly' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('monthly')}
          className="rounded-b-none"
        >
          <FileText className="w-4 h-4 mr-2" />
          Monthly Usage
        </Button>
        <Button
          variant={activeTab === 'top' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('top')}
          className="rounded-b-none"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Top Consumed
        </Button>
        <Button
          variant={activeTab === 'expired' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('expired')}
          className="rounded-b-none"
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          Expired Wastage
        </Button>
      </div>

      {activeTab === 'monthly' && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Usage Report</CardTitle>
            <CardDescription>Medicine consumption for the current month</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="medicine" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="quantity" fill="#3b82f6" name="Quantity Used" />
                  </BarChart>
                </ResponsiveContainer>
                <Table className="mt-6">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine</TableHead>
                      <TableHead>Quantity Used</TableHead>
                      <TableHead>Value (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.medicine}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₹{item.value?.toLocaleString() || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No usage data for this month</p>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'top' && (
        <Card>
          <CardHeader>
            <CardTitle>Top Consumed Medicines</CardTitle>
            <CardDescription>Most frequently used medicines</CardDescription>
          </CardHeader>
          <CardContent>
            {topConsumed.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topConsumed}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalUsed" fill="#10b981" name="Total Used" />
                  </BarChart>
                </ResponsiveContainer>
                <Table className="mt-6">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Medicine</TableHead>
                      <TableHead>Total Used</TableHead>
                      <TableHead>Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topConsumed.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.totalUsed}</TableCell>
                        <TableCell>{item.category}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No consumption data available</p>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'expired' && (
        <Card>
          <CardHeader>
            <CardTitle>Expired Wastage Report</CardTitle>
            <CardDescription>Medicines that expired this year</CardDescription>
          </CardHeader>
          <CardContent>
            {expiredWastage.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Batch Number</TableHead>
                    <TableHead>Quantity Wasted</TableHead>
                    <TableHead>Value Lost (₹)</TableHead>
                    <TableHead>Expiry Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expiredWastage.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.medicine}</TableCell>
                      <TableCell>{item.batchNumber}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="text-red-600">₹{item.valueLost?.toLocaleString() || 0}</TableCell>
                      <TableCell>{new Date(item.expiryDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted">
                    <TableCell colSpan={3}>Total Wastage</TableCell>
                    <TableCell className="text-red-600">
                      ₹{expiredWastage.reduce((sum, item) => sum + (item.valueLost || 0), 0).toLocaleString()}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No expired medicines this year</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}