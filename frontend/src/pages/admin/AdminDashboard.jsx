import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../api/api';
import styles from '../../styles/AdminDashboard.module.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSellers: 0,
    activeListings: 0,
    totalTransactions: 0
  });
  const [users, setUsers] = useState([]);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [analytics, setAnalytics] = useState({
    userGrowth: [],
    transactionVolume: [],
    listingAnalytics: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching admin data...');
        const [statsData, usersData, sellersData] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
          api.get('/admin/pending-sellers')
        ]);

        console.log('Admin data received:', { statsData, usersData, sellersData });
        setStats(statsData.data);
        setUsers(usersData.data);
        setPendingSellers(sellersData.data);

        // Fetch analytics data if on reports tab
        if (activeTab === 'reports') {
          console.log('Fetching analytics data...');
          const [userAnalytics, transactionAnalytics, listingAnalytics] = await Promise.all([
            api.get('/admin/analytics/users'),
            api.get('/admin/analytics/transactions'),
            api.get('/admin/analytics/listings')
          ]);

          console.log('Analytics data received:', { userAnalytics, transactionAnalytics, listingAnalytics });
          setAnalytics({
            userGrowth: userAnalytics.data.userGrowth,
            transactionVolume: transactionAnalytics.data.transactionVolume,
            listingAnalytics: listingAnalytics.data.listingAnalytics
          });
        }
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up socket listeners for real-time updates
    if (socket) {
      socket.on('userStatusChange', (updatedUser) => {
        setUsers(prevUsers => 
          prevUsers.map(u => u._id === updatedUser._id ? updatedUser : u)
        );
      });

      socket.on('newPendingSeller', (newSeller) => {
        setPendingSellers(prev => [...prev, newSeller]);
      });

      socket.on('sellerApproved', (approvedSeller) => {
        setPendingSellers(prev => 
          prev.filter(seller => seller._id !== approvedSeller._id)
        );
        setUsers(prevUsers => 
          prevUsers.map(u => u._id === approvedSeller._id ? approvedSeller : u)
        );
      });
    }

    return () => {
      if (socket) {
        socket.off('userStatusChange');
        socket.off('newPendingSeller');
        socket.off('sellerApproved');
      }
    };
  }, [user, navigate, socket, activeTab]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSuspendUser = async (userId) => {
    try {
      console.log('Suspending user:', userId);
      await api.put(`/admin/users/${userId}/suspend`);
      setUsers(prevUsers =>
        prevUsers.map(u => 
          u._id === userId ? { ...u, status: 'suspended' } : u
        )
      );
    } catch (err) {
      console.error('Error suspending user:', err);
      setError(err.response?.data?.message || 'Failed to suspend user');
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      console.log('Activating user:', userId);
      await api.put(`/admin/users/${userId}/activate`);
      setUsers(prevUsers =>
        prevUsers.map(u => 
          u._id === userId ? { ...u, status: 'active' } : u
        )
      );
    } catch (err) {
      console.error('Error activating user:', err);
      setError(err.response?.data?.message || 'Failed to activate user');
    }
  };

  const handleApproveSeller = async (sellerId) => {
    try {
      console.log('Approving seller:', sellerId);
      await api.put(`/admin/pending-sellers/${sellerId}/approve`);
      setPendingSellers(prev => 
        prev.filter(seller => seller._id !== sellerId)
      );
    } catch (err) {
      console.error('Error approving seller:', err);
      setError(err.response?.data?.message || 'Failed to approve seller');
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedUser) return;

    try {
      console.log('Sending message to user:', selectedUser._id);
      await api.post('/messages', {
        recipientId: selectedUser._id,
        content: messageText
      });
      setMessageText('');
      setShowMessageModal(false);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  const formatMonthYear = (year, month) => {
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const filteredUsers = users
    .filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.dashboard}>
      <div className={styles.sidebar}>
        <h2>Admin Dashboard</h2>
        <button
          className={`${styles.navButton} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`${styles.navButton} ${activeTab === 'users' ? styles.active : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={`${styles.navButton} ${activeTab === 'pending-sellers' ? styles.active : ''}`}
          onClick={() => setActiveTab('pending-sellers')}
        >
          Pending Sellers
        </button>
        <button
          className={`${styles.navButton} ${activeTab === 'reports' ? styles.active : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'overview' && (
          <>
            <h2>Dashboard Overview</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>Total Users</h3>
                <p>{stats.totalUsers}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Active Sellers</h3>
                <p>{stats.activeSellers}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Active Listings</h3>
                <p>{stats.activeListings}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Total Transactions</h3>
                <p>{stats.totalTransactions}</p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <>
            <h2>User Management</h2>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
              className={styles.searchInput}
            />
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th onClick={() => handleSort('name')}>Name</th>
                    <th onClick={() => handleSort('email')}>Email</th>
                    <th onClick={() => handleSort('role')}>Role</th>
                    <th onClick={() => handleSort('status')}>Status</th>
                    <th onClick={() => handleSort('createdAt')}>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        <span className={`${styles.status} ${styles[user.status]}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className={styles.actions}>
                        <button
                          className={`${styles.actionButton} ${styles.message}`}
                          onClick={() => {
                            setSelectedUser(user);
                            setShowMessageModal(true);
                          }}
                        >
                          Message
                        </button>
                        {user.role !== 'admin' && (
                          user.status === 'active' ? (
                            <button
                              className={`${styles.actionButton} ${styles.suspend}`}
                              onClick={() => handleSuspendUser(user._id)}
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              className={`${styles.actionButton} ${styles.activate}`}
                              onClick={() => handleActivateUser(user._id)}
                            >
                              Activate
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'pending-sellers' && (
          <>
            <h2>Pending Seller Approvals</h2>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Business Name</th>
                    <th>Location</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingSellers.map(seller => (
                    <tr key={seller._id}>
                      <td>{seller.name}</td>
                      <td>{seller.email}</td>
                      <td>{seller.businessName}</td>
                      <td>{seller.location}</td>
                      <td>{new Date(seller.createdAt).toLocaleDateString()}</td>
                      <td className={styles.actions}>
                        <button
                          className={`${styles.actionButton} ${styles.approve}`}
                          onClick={() => handleApproveSeller(seller._id)}
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'reports' && (
          <>
            <h2>System Reports</h2>
            <div className={styles.reportsGrid}>
              <div className={styles.reportCard}>
                <h3>User Growth</h3>
                <div className={styles.reportContent}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>New Users</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.userGrowth.map(data => (
                        <tr key={`${data._id.year}-${data._id.month}`}>
                          <td>{formatMonthYear(data._id.year, data._id.month)}</td>
                          <td>{data.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.reportCard}>
                <h3>Transaction Volume</h3>
                <div className={styles.reportContent}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Transactions</th>
                        <th>Total Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.transactionVolume.map(data => (
                        <tr key={`${data._id.year}-${data._id.month}`}>
                          <td>{formatMonthYear(data._id.year, data._id.month)}</td>
                          <td>{data.count}</td>
                          <td>{formatCurrency(data.totalAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.reportCard}>
                <h3>Listing Analytics</h3>
                <div className={styles.reportContent}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Total Listings</th>
                        <th>Average Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.listingAnalytics.map(data => (
                        <tr key={data._id}>
                          <td>{data._id}</td>
                          <td>{data.count}</td>
                          <td>{formatCurrency(data.averagePrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.reportCard}>
                <h3>User Engagement</h3>
                <div className={styles.reportContent}>
                  <div className={styles.engagementStats}>
                    <div>
                      <strong>Active Users:</strong>
                      <span>{stats.totalUsers - users.filter(u => u.status === 'suspended').length}</span>
                    </div>
                    <div>
                      <strong>Active Sellers:</strong>
                      <span>{stats.activeSellers}</span>
                    </div>
                    <div>
                      <strong>Active Listings:</strong>
                      <span>{stats.activeListings}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {showMessageModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Send Message to {selectedUser?.name}</h3>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Enter your message..."
              className={styles.messageInput}
            />
            <div className={styles.modalActions}>
              <button
                className={`${styles.actionButton} ${styles.cancel}`}
                onClick={() => setShowMessageModal(false)}
              >
                Cancel
              </button>
              <button
                className={`${styles.actionButton} ${styles.send}`}
                onClick={handleSendMessage}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 