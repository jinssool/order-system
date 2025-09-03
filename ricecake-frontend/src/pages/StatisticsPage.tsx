// src/pages/StatisticsPage.tsx
import { useState, useMemo } from 'react';
import { useOrders } from '../contexts/OrdersContext';
import { useCustomers } from '../contexts/CustomersContext';
import { useRiceCakes } from '../contexts/RiceCakesContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './StatisticsPage.css';

type Period = 'week' | 'month' | 'year';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

const StatisticsPage = () => {
  const { orders } = useOrders();
  const { customers } = useCustomers();
  const { riceCakes } = useRiceCakes();
  const [period, setPeriod] = useState<Period>('month');
  const [selectedCake, setSelectedCake] = useState<string>(riceCakes[0]?.name || '');

  const filteredOrders = useMemo(() => {
    const now = new Date();
    let startDate = new Date();

    if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setFullYear(now.getFullYear() - 1);
    }
    return orders.filter(order => new Date(order.pickupDate) >= startDate);
  }, [orders, period]);

  // 1. 품목별 판매 순위
  const cakeSalesData = useMemo(() => {
    const sales = filteredOrders.reduce((acc, order) => {
      order.items.forEach(item => {
        acc[item.riceCakeName] = (acc[item.riceCakeName] || 0) + item.quantity;
      });
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(sales)
      .map(([name, 수량]) => ({ name, 수량: parseFloat(수량.toFixed(1)) }))
      .sort((a, b) => b.수량 - a.수량)
      .slice(0, 5);
  }, [filteredOrders]);

  // 2. 특정 품목의 월별 인기도
  const cakeMonthlyPopularity = useMemo(() => {
    const monthlySales = Array.from({ length: 12 }, (_, i) => ({ month: `${i + 1}월`, 수량: 0 }));
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.riceCakeName === selectedCake) {
          const monthIndex = new Date(order.pickupDate).getMonth();
          monthlySales[monthIndex].수량 += item.quantity;
        }
      });
    });
    return monthlySales.map(m => ({ ...m, 수량: parseFloat(m.수량.toFixed(1)) }));
  }, [orders, selectedCake]);
  // 3. 우수 고객 리스트
  const topCustomersData = useMemo(() => {
    const customerOrders = filteredOrders.reduce((acc, order) => {
      acc[order.customerId] = (acc[order.customerId] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    return Object.entries(customerOrders)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({
        name: customers.find(c => c.id === Number(id))?.name || '알수없음',
        주문건수: count,
      }));
  }, [filteredOrders, customers]);

  return (
    <div className="page-container stats-page">
      <div className="page-header">
        <h2>판매 통계</h2>
        <div className="period-selector">
          <button className={period === 'week' ? 'active' : ''} onClick={() => setPeriod('week')}>최근 1주</button>
          <button className={period === 'month' ? 'active' : ''} onClick={() => setPeriod('month')}>최근 1개월</button>
          <button className={period === 'year' ? 'active' : ''} onClick={() => setPeriod('year')}>최근 1년</button>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>품목별 판매 순위 (수량 기준 TOP 5)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cakeSalesData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="수량" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-card">
          <h3>우수 고객 (주문 건수 TOP 5)</h3>
            <div className="top-customer-list">
              {topCustomersData.map((customer, index) => (
                <div key={index} className="customer-item">
                  <span className="rank">{index + 1}</span>
                  <span className="name">{customer.name}</span>
                  <span className="count">{customer.주문건수} 건</span>
                </div>
              ))}
            </div>
        </div>
        
        <div className="stat-card full-width">
          <h3>특정 품목 월별 판매량</h3>
          <div className="cake-selector">
            <select value={selectedCake} onChange={e => setSelectedCake(e.target.value)}>
              {riceCakes.map(cake => <option key={cake.id} value={cake.name}>{cake.name}</option>)}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cakeMonthlyPopularity}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="수량" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
export default StatisticsPage;