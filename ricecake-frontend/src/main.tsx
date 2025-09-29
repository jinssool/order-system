// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

// Providers removed - using API calls directly

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
import RiceCakeListPage from './pages/RiceCakeListPage';
import RiceCakeCreatePage from './pages/RiceCakeCreatePage';
import RiceCakeEditPage from './pages/RiceCakeEditPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import RiceCakeDetailPage from './pages/RiceCakeDetailPage';
import ProductionPage from './pages/ProductionPage';
import ProductionOrdersPage from './pages/ProductionOrdersPage';

// ✅ PWA Service Worker Registration
// 모든 컴포넌트가 렌더링되기 전에 등록하는 것이 올바른 순서입니다.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker 등록 성공:', registration);
        })
        .catch(error => {
          console.error('Service Worker 등록 실패:', error);
        });
  });
}

// ✅ 라우터 설정: 모든 페이지 경로를 여기에 정의합니다.
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // App 컴포넌트가 모든 자식 경로의 레이아웃 역할을 합니다.
    children: [
      // 주문 관련 경로들
      { path: "", element: <OrderListPage /> },
      { path: "orders/new", element: <NewOrderPage /> },
      { path: "orders/:orderId", element: <OrderDetailPage /> },
      { path: "orders/:orderId/edit", element: <OrderEditPage /> },

      // 고객 관련 경로들
      { path: "customers", element: <CustomerListPage /> },
      { path: "customers/new", element: <CustomerCreatePage /> },
      { path: "customers/:customerId", element: <CustomerDetailPage /> },
      { path: "customers/:customerId/edit", element: <CustomerEditPage /> },

      // --- 키오스크 주문 경로 추가 ---
      { path: "orders/new-kiosk", element: <NewOrderKioskPage /> },
      // 떡 관리 관련 경로들
      { path: "rice-cakes", element: <RiceCakeListPage /> },
      { path: "rice-cakes/new", element: <RiceCakeCreatePage /> },
      { path: "rice-cakes/:cakeId", element: <RiceCakeDetailPage /> },
      { path: "rice-cakes/:cakeId/edit", element: <RiceCakeEditPage /> },

      { path: "production", element: <ProductionPage /> },
      { path: "production/orders", element: <ProductionOrdersPage /> },
    ]
  }
]);

// ✅ 단일 진입점: API 호출을 직접 사용하는 구조
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
);