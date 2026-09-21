import React from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { money } from '../../utils';

const CHART_COLORS = ['#111827', '#374151', '#6b7280', '#9ca3af', '#d1d5db'];

export function Overview({ data, onOrders }) {
  const categoryTotal = data.categories.reduce((sum, item) => sum + Number(item.revenue || 0), 0);
  const statusTotal = data.statusBreakdown.reduce((sum, item) => sum + Number(item.count || 0), 0);

  return (
    <div className="dashboard">
      <div className="stat-grid">
        <Stat title="Revenue" value={money(data.revenue)} note={data.orders ? `${money(data.avgOrderValue)} avg. order` : 'No orders yet'} />
        <Stat title="Orders" value={data.orders} note={`${statusTotal} tracked in dashboard`} />
        <Stat title="Products" value={data.products} note={`${data.totalInventoryUnits} units in stock`} />
        <Stat title="Low stock" value={data.lowStock} note={data.lowStock ? 'Needs attention' : 'Inventory healthy'} warning={data.lowStock > 0} />
      </div>

      <div className="chart-grid">
        <div className="panel">
          <div className="panel-head">
            <div><h3>Revenue trend</h3><span>Recorded monthly revenue and orders</span></div>
            <span className="panel-badge">Last 6 months</span>
          </div>
          <div className="chart chart-tall">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthly} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopOpacity={0.22} />
                    <stop offset="100%" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis yAxisId="revenue" axisLine={false} tickLine={false} tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} />
                <YAxis yAxisId="orders" orientation="right" axisLine={false} tickLine={false} tickFormatter={(value) => `${value}`} width={32} />
                <Tooltip formatter={(value, name) => name === 'Revenue' ? money(value) : `${value} orders`} labelFormatter={(label) => `Month: ${label}`} />
                <Area yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#111827" strokeWidth={3} fill="url(#revenueFill)" name="Revenue" />
                <Area yAxisId="orders" type="monotone" dataKey="orders" stroke="#6b7280" fill="none" strokeWidth={2} name="Orders" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <DonutPanel title="Revenue by category" subtitle="Share of recorded sales" totalLabel={money(categoryTotal)} centerValue={money(categoryTotal)} centerLabel="Total" data={data.categories} dataKey="revenue" nameKey="category" formatter={(value) => money(value)} percentage={(item) => categoryTotal ? Math.round(item.revenue / categoryTotal * 100) : 0} />
      </div>

      <div className="chart-grid">
        <div className="panel">
          <div className="panel-head"><div><h3>Top products</h3><span>Recorded revenue by product</span></div></div>
          <div className="chart chart-tall">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topProducts} layout="vertical" margin={{ top: 8, right: 18, left: 4, bottom: 8 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} />
                <YAxis type="category" dataKey="name" width={150} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value, name, entry) => name === 'Revenue' ? [money(value), `Revenue · ${entry?.payload?.units || 0} units`] : [value, name]} />
                <Bar dataKey="revenue" name="Revenue" fill="#111827" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-note">Units sold: {data.topProducts.map((item) => `${item.name} ${item.units}`).join(' · ')}</div>
        </div>

        <DonutPanel title="Order status" subtitle="Current order pipeline" totalLabel={`${statusTotal} orders`} centerValue={statusTotal} centerLabel="Orders" data={data.statusBreakdown} dataKey="count" nameKey="status" formatter={(value) => `${value} orders`} percentage={(item) => statusTotal ? Math.round(item.count / statusTotal * 100) : 0} />
      </div>

      <div className="panel recent-panel">
        <div className="panel-head"><div><h3>Recent orders</h3><span>Latest customer activity</span></div><button type="button" className="panel-link" onClick={onOrders}>Manage orders →</button></div>
        <div className="order-list">
          {data.recent.length ? data.recent.map((order) => (
            <div className="order-row" key={order.id}>
              <div><strong>#{order.id} · {order.customer_name}</strong><span>{new Date(order.created_at).toLocaleDateString('en-IN')}</span></div>
              <div><strong>{money(order.total_amount)}</strong><span className={`status ${order.status.toLowerCase()}`}>{order.status}</span></div>
            </div>
          )) : <div className="empty small"><h3>No orders yet</h3></div>}
        </div>
      </div>
    </div>
  );
}

function DonutPanel({ title, subtitle, totalLabel, centerValue, centerLabel, data, dataKey, nameKey, formatter, percentage }) {
  return (
    <div className="panel">
      <div className="panel-head"><div><h3>{title}</h3><span>{subtitle}</span></div><strong className="chart-total">{totalLabel}</strong></div>
      <div className="donut-layout">
        <div className="donut">
          {data.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey={dataKey} nameKey={nameKey} cx="50%" cy="50%" innerRadius={68} outerRadius={96} paddingAngle={3}>
                  {data.map((_, index) => <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={formatter} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty small"><h3>No data yet</h3></div>}
          <div className="donut-center"><strong>{centerValue}</strong><span>{centerLabel}</span></div>
        </div>
        <div className="legend-list">
          {data.map((item, index) => <div className="legend-row" key={item[nameKey]}><span><i className="legend-dot" style={{ background: CHART_COLORS[index % CHART_COLORS.length] }} />{item[nameKey]}</span><strong>{percentage(item)}%</strong></div>)}
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value, note, warning = false }) {
  return <div className={`stat ${warning ? 'stat-warning' : ''}`}><span>{title}</span><strong>{value}</strong>{note && <small>{note}</small>}</div>;
}
