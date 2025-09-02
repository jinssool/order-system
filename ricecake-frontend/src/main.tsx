// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

// Providers
import { OrdersProvider } from './contexts/OrdersContext';
import { CustomersProvider } from './contexts/CustomersContext';
import { RiceCakesProvider } from './contexts/RiceCakesContext'; // 새로 추가

// Main App Component & Global CSS
import App from './App';
import './index.css';

// Page Components
import OrderListPage from './pages/OrderListPage';
import NewOrderPage from './pages/NewOrderPage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrderEditPage from './pages/OrderEditPage';
import CustomerListPage from './pages/CustomerListPage';
import CustomerCreatePage from './pages/CustomerCreatePage';
import CustomerEditPage from './pages/CustomerEditPage';
import NewOrderKioskPage from './pages/NewOrderKioskPage';
import RiceCakeListPage from './pages/RiceCakeListPage'; // 새로 추가
import RiceCakeCreatePage from './pages/RiceCakeCreatePage'; // 새로 추가
import RiceCakeEditPage from './pages/RiceCakeEditPage'; // 새로 추가
import CustomerDetailPage from './pages/CustomerDetailPage'; // 새로 추가
import RiceCakeDetailPage from './pages/RiceCakeDetailPage'; // 새로 추가
import StatisticsPage from './pages/StatisticsPage'; // 새로 추가




// 라우터 설정: 모든 페이지 경로를 여기에 정의합니다.
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      // 주문 관련 경로들
      { path: "", element: <OrderListPage /> },
      { path: "orders/new", element: <NewOrderPage /> },
      { path: "orders/:orderId", element: <OrderDetailPage /> },
      { path: "orders/:orderId/edit", element: <OrderEditPage /> },

      // 고객 관련 경로들
      { path: "customers", element: <CustomerListPage /> },
      { path: "customers/new", element: <CustomerCreatePage /> },
      { path: "customers/:customerId/edit", element: <CustomerEditPage /> },

      // --- 키오스크 주문 경로 추가 ---
      { path: "orders/new-kiosk", element: <NewOrderKioskPage /> },
      // 떡 관리 관련 경로들
      { path: "rice-cakes", element: <RiceCakeListPage /> },
      { path: "rice-cakes/new", element: <RiceCakeCreatePage /> },
      { path: "rice-cakes/:cakeId/edit", element: <RiceCakeEditPage /> },

      { path: "stats", element: <StatisticsPage /> },
      { path: "customers/:customerId", element: <CustomerDetailPage /> }, // 고객 상세 페이지 라우트
      { path: "rice-cakes/:cakeId", element: <RiceCakeDetailPage /> }, // 떡 상세 페이지 라우트
      

    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CustomersProvider>
      <RiceCakesProvider>
        <OrdersProvider>
          <RouterProvider router={router} />
        </OrdersProvider>
      </RiceCakesProvider>
    </CustomersProvider>
  </React.StrictMode>,
)