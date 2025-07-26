// import React, { useState, useEffect } from 'react';
// import {
//   Container,
//   Typography,
//   Grid,
//   Card,
//   CardContent,
//   Stack,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
// } from '@mui/material';
// import {
//   TrendingUp,
//   TrendingDown,
//   People,
//   School,
//   AttachMoney,
//   CalendarMonth,
// } from '@mui/icons-material';
// import {
//   LineChart,
//   Line,
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   Cell,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from 'recharts';
// import api from '../../services/api';

// interface AnalyticsData {
//   revenue: Array<{ month: string; revenue: number }>;
//   engagement: Array<{ day: string; lessons: number; posts: number }>;
//   userGrowth: Array<{ month: string; users: number }>;
//   courseCompletion: Array<{ course: string; rate: number }>;
//   demographics: Array<{ level: string; count: number }>;
// }

// const COLORS = ['#FF6B6B', '#4ECDC4', '#FFB7C5', '#00B894', '#FFA502'];

// export const Analytics: React.FC = () => {
//   const [timeRange, setTimeRange] = useState('30days');
//   const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
//     revenue: [],
//     engagement: [],
//     userGrowth: [],
//     courseCompletion: [],
//     demographics: [],
//   });

//   useEffect(() => {
//     fetchAnalyticsData();
//   }, [timeRange]);

//   const fetchAnalyticsData = async () => {
//     try {
//       // In real implementation, this would fetch based on timeRange
//       const [revenue, engagement] = await Promise.all([
//         api.get('/admin/analytics/revenue'),
//         api.get('/admin/analytics/engagement'),
//       ]);

//       setAnalyticsData({
//         revenue: revenue.data,
//         engagement: engagement.data,
//         userGrowth: [
//           { month: 'Jan', users: 850 },
//           { month: 'Feb', users: 920 },
//           { month: 'Mar', users: 1050 },
//           { month: 'Apr', users: 1120 },
//           { month: 'May', users: 1200 },
//           { month: 'Jun', users: 1247 },
//         ],
//         courseCompletion: [
//           { course: 'Japan in Context', rate: 68 },
//           { course: 'JLPT N5', rate: 75 },
//           { course: 'JLPT N4', rate: 62 },
//           { course: 'JLPT N3', rate: 45 },
//         ],
//         demographics: [
//           { level: 'N5', count: 450 },
//           { level: 'N4', count: 320 },
//           { level: 'N3', count: 250 },
//           { level: 'N2', count: 150 },
//           { level: 'N1', count: 77 },
//         ],
//       });
//     } catch (error) {
//       console.error('Failed to fetch analytics:', error);
//     }
//   };

//   const totalRevenue = analyticsData.revenue.reduce((sum, item) => sum + item.revenue, 0);
//   // const averageRevenue = totalRevenue / (analyticsData.revenue.length || 1);
//   const revenueGrowth = analyticsData.revenue.length > 1
//     ? ((analyticsData.revenue[analyticsData.revenue.length - 1].revenue - analyticsData.revenue[0].revenue) / analyticsData.revenue[0].revenue) * 100
//     : 0;

//   return (
//     <Container maxWidth="xl" sx={{ py: 4 }}>
//       <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
//         <Typography variant="h4" fontWeight={700}>
//           Analytics Dashboard
//         </Typography>
//         <FormControl size="small" sx={{ minWidth: 150 }}>
//           <InputLabel>Time Range</InputLabel>
//           <Select value={timeRange} label="Time Range" onChange={(e) => setTimeRange(e.target.value)}>
//             <MenuItem value="7days">Last 7 Days</MenuItem>
//             <MenuItem value="30days">Last 30 Days</MenuItem>
//             <MenuItem value="90days">Last 90 Days</MenuItem>
//             <MenuItem value="1year">Last Year</MenuItem>
//           </Select>
//         </FormControl>
//       </Stack>

//       {/* Key Metrics */}
//       <Grid container spacing={3} mb={4}>
//         <Grid size={{ xs: 12, sm:6, md: 3 }}>
//           <Card>
//             <CardContent>
//               <Stack spacing={1}>
//                 <Stack direction="row" justifyContent="space-between" alignItems="center">
//                   <AttachMoney color="action" />
//                   <Stack direction="row" alignItems="center" spacing={0.5}>
//                     {revenueGrowth > 0 ? (
//                       <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
//                     ) : (
//                       <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
//                     )}
//                     <Typography variant="caption" color={revenueGrowth > 0 ? 'success.main' : 'error.main'}>
//                       {Math.abs(revenueGrowth).toFixed(1)}%
//                     </Typography>
//                   </Stack>
//                 </Stack>
//                 <Typography variant="h4" fontWeight={700}>
//                   ¥{totalRevenue.toLocaleString()}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   Total Revenue
//                 </Typography>
//               </Stack>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid size={{ xs: 12, sm:6, md: 3 }}>
//           <Card>
//             <CardContent>
//               <Stack spacing={1}>
//                 <People color="action" />
//                 <Typography variant="h4" fontWeight={700}>
//                   1,247
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   Total Users
//                 </Typography>
//               </Stack>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid size={{ xs: 12, sm:6, md: 3 }}>
//           <Card>
//             <CardContent>
//               <Stack spacing={1}>
//                 <School color="action" />
//                 <Typography variant="h4" fontWeight={700}>
//                   68%
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   Avg. Completion Rate
//                 </Typography>
//               </Stack>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid size={{ xs: 12, sm:6, md: 3 }}>
//           <Card>
//             <CardContent>
//               <Stack spacing={1}>
//                 <CalendarMonth color="action" />
//                 <Typography variant="h4" fontWeight={700}>
//                   892
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   Active Users (30d)
//                 </Typography>
//               </Stack>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* Charts */}
//       <Grid container spacing={3}>
//         {/* Revenue Chart */}
//         <Grid size={{ xs: 12, md: 8 }}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" fontWeight={600} gutterBottom>
//                 Revenue Trend
//               </Typography>
//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={analyticsData.revenue}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="month" />
//                   <YAxis />
//                   <Tooltip formatter={(value) => `¥${value.toLocaleString()}`} />
//                   <Legend />
//                   <Line
//                     type="monotone"
//                     dataKey="revenue"
//                     stroke="#FF6B6B"
//                     strokeWidth={2}
//                     dot={{ fill: '#FF6B6B' }}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* User Demographics */}
//         <Grid size={{ xs: 12, md: 4 }}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" fontWeight={600} gutterBottom>
//                 User Demographics
//               </Typography>
//               <ResponsiveContainer width="100%" height={300}>
//                 <PieChart>
//                   <Pie
//                     data={analyticsData.demographics}
//                     cx="50%"
//                     cy="50%"
//                     labelLine={false}
//                     label={({ level, count }) => `${level}: ${count}`}
//                     outerRadius={80}
//                     fill="#8884d8"
//                     dataKey="count"
//                   >
//                     {analyticsData.demographics.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                 </PieChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Engagement Chart */}
//         <Grid size={{ xs: 12, md: 6 }}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" fontWeight={600} gutterBottom>
//                 Daily Engagement
//               </Typography>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={analyticsData.engagement}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="day" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Bar dataKey="lessons" fill="#4ECDC4" />
//                   <Bar dataKey="posts" fill="#FFB7C5" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Course Completion */}
//         <Grid size={{ xs: 12, md: 6 }}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" fontWeight={600} gutterBottom>
//                 Course Completion Rates
//               </Typography>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={analyticsData.courseCompletion} layout="horizontal">
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis type="number" domain={[0, 100]} />
//                   <YAxis dataKey="course" type="category" width={100} />
//                   <Tooltip formatter={(value) => `${value}%`} />
//                   <Bar dataKey="rate" fill="#00B894">
//                     {analyticsData.courseCompletion.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Bar>
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>
//     </Container>
//   );
// };


// frontend/src/pages/admin/Analytics.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  School,
  AttachMoney,
  CalendarMonth,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../../services/api';

interface AnalyticsOverview {
  totalUsers: number;
  activeUsers: number;
  monthlyRevenue: number;
  completionRate: number;
  userGrowth: number;
  revenueGrowth: number;
}

interface AnalyticsData {
  revenue: Array<{ month: string; revenue: number }>;
  engagement: Array<{ day: string; lessons: number; posts: number }>;
  userGrowth: Array<{ month: string; users: number }>;
  courseCompletion: Array<{ course: string; rate: number }>;
  demographics: Array<{ level: string; count: number }>;
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#FFB7C5', '#00B894', '#FFA502'];

// Custom formatter to ensure proper currency display
const currencyFormatter = (value: any) => {
  if (typeof value !== 'number' || isNaN(value)) return '¥0';
  return `¥${value.toLocaleString()}`;
};

// Validate and clean data
const validateRevenueData = (data: any[]): Array<{ month: string; revenue: number }> => {
  if (!Array.isArray(data)) return [];

  return data.map(item => ({
    month: String(item.month || ''),
    revenue: Number(item.revenue) || 0,
  })).filter(item => item.month && !isNaN(item.revenue));
};

const validateEngagementData = (data: any[]): Array<{ day: string; lessons: number; posts: number }> => {
  if (!Array.isArray(data)) return [];

  return data.map(item => ({
    day: String(item.day || ''),
    lessons: Number(item.lessons) || 0,
    posts: Number(item.posts) || 0,
  })).filter(item => item.day);
};

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverview>({
    totalUsers: 0,
    activeUsers: 0,
    monthlyRevenue: 0,
    completionRate: 0,
    userGrowth: 0,
    revenueGrowth: 0,
  });
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    revenue: [],
    engagement: [],
    userGrowth: [],
    courseCompletion: [],
    demographics: [],
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch overview data and detailed analytics
      const [
        overviewResponse,
        revenueResponse,
        engagementResponse
      ] = await Promise.all([
        api.get('/admin/analytics/overview'),
        api.get('/admin/analytics/revenue'),
        api.get('/admin/analytics/engagement'),
      ]);

      // Set overview data
      setOverview(overviewResponse.data);

      // Validate and clean the data
      const revenueData = validateRevenueData(revenueResponse.data);
      const engagementData = validateEngagementData(engagementResponse.data);

      // Mock data for other charts (replace with actual API calls when available)
      const mockUserGrowth = [
        { month: 'Jan', users: 850 },
        { month: 'Feb', users: 920 },
        { month: 'Mar', users: 1050 },
        { month: 'Apr', users: 1120 },
        { month: 'May', users: 1200 },
        { month: 'Jun', users: overview.totalUsers || 1247 },
      ];

      const mockCourseCompletion = [
        { course: 'Japan in Context', rate: overview.completionRate || 68 },
        { course: 'JLPT N5', rate: 75 },
        { course: 'JLPT N4', rate: 62 },
        { course: 'JLPT N3', rate: 45 },
      ];

      const mockDemographics = [
        { level: 'N5', count: Math.floor((overview.totalUsers || 1247) * 0.36) },
        { level: 'N4', count: Math.floor((overview.totalUsers || 1247) * 0.26) },
        { level: 'N3', count: Math.floor((overview.totalUsers || 1247) * 0.20) },
        { level: 'N2', count: Math.floor((overview.totalUsers || 1247) * 0.12) },
        { level: 'N1', count: Math.floor((overview.totalUsers || 1247) * 0.06) },
      ];

      setAnalyticsData({
        revenue: revenueData,
        engagement: engagementData,
        userGrowth: mockUserGrowth,
        courseCompletion: mockCourseCompletion,
        demographics: mockDemographics,
      });
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
      setError(error.response?.data?.error || 'Failed to load analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics with validation
  const totalRevenue = analyticsData.revenue.reduce((sum, item) => {
    const revenue = Number(item.revenue) || 0;
    return sum + revenue;
  }, 0);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress />
            <Typography variant="h6">Loading analytics...</Typography>
          </Stack>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
          {error}
        </Alert>
        <Box sx={{ textAlign: 'center' }}>
          <button onClick={fetchAnalyticsData}>Retry</button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={700}>
          Analytics Dashboard
        </Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Time Range</InputLabel>
          <Select value={timeRange} label="Time Range" onChange={(e) => setTimeRange(e.target.value)}>
            <MenuItem value="7days">Last 7 Days</MenuItem>
            <MenuItem value="30days">Last 30 Days</MenuItem>
            <MenuItem value="90days">Last 90 Days</MenuItem>
            <MenuItem value="1year">Last Year</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Key Metrics */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <AttachMoney color="action" />
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    {overview.revenueGrowth > 0 ? (
                      <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                    ) : (
                      <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                    )}
                    <Typography variant="caption" color={overview.revenueGrowth > 0 ? 'success.main' : 'error.main'}>
                      {Math.abs(overview.revenueGrowth).toFixed(1)}%
                    </Typography>
                  </Stack>
                </Stack>
                <Typography variant="h4" fontWeight={700}>
                  ¥{overview.monthlyRevenue.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monthly Revenue
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <People color="action" />
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    {overview.userGrowth > 0 ? (
                      <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                    ) : (
                      <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                    )}
                    <Typography variant="caption" color={overview.userGrowth > 0 ? 'success.main' : 'error.main'}>
                      {Math.abs(overview.userGrowth)}%
                    </Typography>
                  </Stack>
                </Stack>
                <Typography variant="h4" fontWeight={700}>
                  {overview.totalUsers.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Users
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <School color="action" />
                <Typography variant="h4" fontWeight={700}>
                  {overview.completionRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avg. Completion Rate
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <CalendarMonth color="action" />
                <Typography variant="h4" fontWeight={700}>
                  {overview.activeUsers.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Users (30d)
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Revenue Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Revenue Trend
              </Typography>
              {analyticsData.revenue.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis
                      tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}k`}
                      domain={['dataMin', 'dataMax']}
                    />
                    <Tooltip formatter={currencyFormatter} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#FF6B6B"
                      strokeWidth={2}
                      dot={{ fill: '#FF6B6B' }}
                      name="Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No revenue data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* User Demographics */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                User Demographics
              </Typography>
              {analyticsData.demographics.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.demographics}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ level, count }) => `${level}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analyticsData.demographics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No demographic data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Engagement Chart */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Daily Engagement
              </Typography>
              {analyticsData.engagement.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.engagement}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="lessons" fill="#4ECDC4" name="Lessons" />
                    <Bar dataKey="posts" fill="#FFB7C5" name="Posts" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No engagement data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Course Completion */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Course Completion Rates
              </Typography>
              {analyticsData.courseCompletion.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.courseCompletion} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="course" type="category" width={100} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="rate" fill="#00B894">
                      {analyticsData.courseCompletion.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No completion data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};