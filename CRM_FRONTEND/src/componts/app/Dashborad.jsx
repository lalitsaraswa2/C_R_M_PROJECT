import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Col, Row, Statistic } from 'antd';
import { toast } from 'react-toastify';

axios.defaults.baseURL = 'http://localhost:8070'; // Set base URL globally

function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const customerResponse = await axios.get('/coustmer?page=1&limit=1000');
        const logResponse = await axios.get('/logs?page=1&limit=1000');

        console.log("Customer response:", customerResponse.data);
        console.log("Log response:", logResponse.data);

        setCustomers(customerResponse.data.customers || []);
        setLogs(logResponse.data.logs || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error fetching data: " + (error.response?.data?.message || error.message));
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalCustomers = customers.length;
  const totalLogs = logs.length;
  const pendingLogs = logs.filter(log => log.status === 'waiting').length;
  const completedLogs = logs.filter(log => log.status === 'completed').length;

  const activeCustomers = customers.filter(customer =>
    logs.some(log => log.customer?._id === customer._id && log.status !== 'completed')
  ).length;

  if (isLoading) {
    return <div style={{ padding: 24 }}>Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card><Statistic title="Total Customers" value={totalCustomers} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="Total Logs" value={totalLogs} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="Pending Logs" value={pendingLogs} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="Completed Logs" value={completedLogs} /></Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={6}>
          <Card><Statistic title="Active Customers" value={activeCustomers} /></Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
