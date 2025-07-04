@@ .. @@
   const getOrderStats = () => {
-    const pending = orders.filter(o => o.status === 'pending').length;
     const inProgress = orders.filter(o => o.status === 'in-progress').length;
     const completed = orders.filter(o => o.status === 'completed').length;
     const updated = orders.filter(o => o.status === 'updated').length;
     const totalRevenue = orders.reduce((sum, order) => sum + order.serviceFeePrice, 0);
-    return { pending, inProgress, completed, updated, total: orders.length, totalRevenue };
+    return { inProgress, completed, updated, total: orders.length, totalRevenue };
   };
@@ .. @@
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
                {[
                  { label: t('dashboard.totalOrders'), value: stats.total, icon: TrendingUp, color: 'accent-cyan' },
-                  { label: t('dashboard.pending'), value: stats.pending, color: 'accent-yellow', bg: 'bg-yellow-500' },
                  { label: t('dashboard.inProgress'), value: stats.inProgress, color: 'accent-blue', bg: 'bg-blue-500' },
                  { label: t('dashboard.updated'), value: stats.updated, color: 'text-violet-400', bg: 'bg-violet-500' },
                  { label: t('dashboard.completed'), value: stats.completed, color: 'accent-green', bg: 'bg-green-500' },
                  { label: t('dashboard.totalRevenue'), value: `${stats.totalRevenue}с`, icon: '💰', color: 'accent-green' }
                ]}