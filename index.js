const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("combined"));
app.disable("x-powered-by");

const services = [
  // User Management Service : port 8080
  {
    route: "/register",
    target: "http://localhost:8080/auth/register",
    method: "POST",
    pathRewrite: { "^/register": "" },
  },
  {
    route: "/login",
    target: "http://localhost:8080/auth/login",
    method: "POST",
    pathRewrite: { "^/login": "" },
  },
  {
    route: "/refreshTocken",
    target: "http://localhost:8080/auth/refresh",
    method: "POST",
    pathRewrite: { "^/refreshTocken": "" },
  },
  {
    route: "/service/getPhoneNumber/:id",
    target: "http://localhost:8080/service/get-phoneNumber",
    method: "GET",
    pathRewrite: { "^/service/getPhoneNumber": "" },
  },
  {
    route: "/service/getName/:id",
    target: "http://localhost:8080/service/get-name",
    method: "GET",
    pathRewrite: { "^/service/getName": "" },
  },
  {
    route: "/service/getEmail/:id",
    target: "http://localhost:8080/service/get-email",
    method: "GET",
    pathRewrite: { "^/service/getEmail": "" },
  },
  {
    route: "/service/getAllCustomers",
    target: "http://localhost:8080/service/get-all-customers",
    method: "GET",
    pathRewrite: { "^/service/getAllCustomers": "" },
  },
  {
    route: "/user/viewProfile/:id",
    target: "http://localhost:8080/user/view-profile",
    method: "GET",
    pathRewrite: { "^/user/viewProfile": "" },
    onProxyReq: (proxyReq, req, res) => {
      const authHeader = req.headers["authorization"];
      if (authHeader) {
        proxyReq.setHeader("Authorization", authHeader);
      }
    },
  },
  {
    route: "/user/updateProfile/:id",
    target: "http://localhost:8080/user/update-profile",
    method: "PUT",
    pathRewrite: { "^/user/updateProfile": "" },
    onProxyReq: (proxyReq, req, res) => {
      const authHeader = req.headers["authorization"];
      if (authHeader) {
        proxyReq.setHeader("Authorization", authHeader);
      }
    },
  },
  {
    route: "/admin/getUser/:id",
    target: "http://localhost:8080/admin/get-user",
    method: "GET",
    pathRewrite: { "^/admin/getUser": "" },
    onProxyReq: (proxyReq, req, res) => {
      const authHeader = req.headers["authorization"];
      if (authHeader) {
        proxyReq.setHeader("Authorization", authHeader);
      }
    },
  },
  {
    route: "/admin/getAllUsers",
    target: "http://localhost:8080/admin/get-all-users",
    method: "GET",
    pathRewrite: { "^/admin/getAllUsers": "" },
    onProxyReq: (proxyReq, req, res) => {
      const authHeader = req.headers["authorization"];
      if (authHeader) {
        proxyReq.setHeader("Authorization", authHeader);
      }
    },
  },
  {
    route: "/admin/delteUser/:id",
    target: "http://localhost:8080/admin/delete-user",
    method: "DELETE",
    pathRewrite: { "^/admin/delteUser": "" },
    onProxyReq: (proxyReq, req, res) => {
      const authHeader = req.headers["authorization"];
      if (authHeader) {
        proxyReq.setHeader("Authorization", authHeader);
      }
    },
  },
  {
    route: "/admin/updateUser/:id",
    target: "http://localhost:8080/admin/update-user",
    method: "PUT",
    pathRewrite: { "^/admin/updateUser": "" },
    onProxyReq: (proxyReq, req, res) => {
      const authHeader = req.headers["authorization"];
      if (authHeader) {
        proxyReq.setHeader("Authorization", authHeader);
      }
    },
  },

  // Billing Service : port 8081
  {
    route: "/makePayment",
    target: "http://localhost:8081/api/billing/payment",
    method: "POST",
    pathRewrite: { "^/makePayment": "" },
  },
  {
    route: "/createBillingDetails",
    target: "http://localhost:8081/api/billing/details",
    method: "POST",
    pathRewrite: { "^/createBillingDetails": "" },
  },
  {
    route: "/getBillingDetails/:id",
    target: "http://localhost:8081/api/billing/details",
    method: "GET",
    pathRewrite: { "^/getBillingDetails": "" },
  },
  {
    route: "/updateBillingDetails/:id",
    target: "http://localhost:8081/api/billing/details",
    method: "PUT",
    pathRewrite: { "^/updateBillingDetails": "" },
  },
  {
    route: "/getPaymentHistory/:id",
    target: "http://localhost:8081/api/billing/history",
    method: "GET",
    pathRewrite: { "^/getPaymentHistory": "" },
  },
  {
    route: "/emailMonthlyStatement/:userId",
    target: "http://localhost:8081/api/billing/email/statement/",
    method: "POST",
    pathRewrite: { "^/emailMonthlyStatement": "" },
  },

  // Notification (Port 8082)
  {
    route: "/sendEmail",
    target: "http://localhost:8082/sendEmail",
    method: "POST",
    pathRewrite: { "^/sendEmail": "" },
  },
  {
    route: "/sendNotification",
    target: "http://localhost:8082/sendNotification",
    method: "POST",
    pathRewrite: { "^/sendNotification": "" },
  },
  {
    route: "/sendSMS",
    target: "http://localhost:8082/sendSMS",
    method: "POST",
    pathRewrite: { "^/sendSMS": "" },
  },
  {
    route: "/sendBroadcastNotification",
    target: "http://localhost:8082/sendBroadcastNotification",
    method: "POST",
    pathRewrite: { "^/sendBroadcastNotification": "" },
  },

  // Service Activation/Deactivation (Port 8083)
  {
    route: "/registerPackage",
    target: "http://localhost:8083/api/v1/package/registerPackage",
    method: "POST",
    pathRewrite: { "^/registerPackage": "" },
  },
  {
    route: "/updatePackage",
    target: "http://localhost:8083/api/v1/package/updatePackage",
    method: "PUT",
    pathRewrite: { "^/updatePackage": "" },
  },
  {
    route: "/getAllPackages",
    target: "http://localhost:8083/api/v1/package/getAllPackages",
    method: "GET",
    pathRewrite: { "^/getAllPackages": "" },
  },
  {
    route: "/getActivePackages/:id",
    target: "http://localhost:8083/api/v1/package/getActivePackages",
    method: "GET",
    pathRewrite: { "^/getActivePackages": "" },
  },
  {
    route: "/activatePackage/:id",
    target: "http://localhost:8083/api/v1/package/activatePackage",
    method: "POST",
    pathRewrite: { "^/activatePackage": "" },
  },
  {
    route: "/deactivatePackage/:id",
    target: "http://localhost:8083/api/v1/package/deactivatePackage",
    method: "DELETE",
    pathRewrite: { "^/deactivatePackage": "" },
  },

  // Chat (Port 8084)
  {
    route: "/sendMessage",
    target: "http://localhost:8084/sendMessage",
    method: "POST",
    pathRewrite: { "^/sendMessage": "" },
  },
  {
    route: "/createChat",
    target: "http://localhost:8084/createChat",
    method: "POST",
    pathRewrite: { "^/createChat": "" },
  },
  {
    route: "/viewChat/:id",
    target: "http://localhost:8084/api/chat",
    method: "GET",
    pathRewrite: { "^/viewChats": "" },
  },
  {
    route: "/getMessageHistory/:id",
    target: "http://localhost:8084/api/chat/history",
    method: "GET",
    pathRewrite: { "^/getMessageHistory": "" },
  },
];

const rateLimit = 20;
const interval = 60 * 1000;

const requestCounts = {};

setInterval(() => {
  Object.keys(requestCounts).forEach((ip) => {
    requestCounts[ip] = 0;
  });
}, interval);

function rateLimitAndTimeout(req, res, next) {
  const ip = req.ip;

  requestCounts[ip] = (requestCounts[ip] || 0) + 1;

  if (requestCounts[ip] > rateLimit) {
    return res.status(429).json({
      code: 429,
      status: "Error",
      message: "Rate limit exceeded.",
      data: null,
    });
  }

  req.setTimeout(15000, () => {
    res.status(504).json({
      code: 504,
      status: "Error",
      message: "Gateway timeout.",
      data: null,
    });
    req.abort();
  });

  next();
}

app.use(rateLimitAndTimeout);

services.forEach((service) => {
  app[service.method.toLowerCase()](
    service.route,
    createProxyMiddleware({
      target: service.target,
      changeOrigin: true,
      pathRewrite: service.pathRewrite || {},
      onProxyReq: service.onProxyReq || undefined,
    })
  );
});

app.use((_req, res) => {
  res.status(404).json({
    code: 404,
    status: "Error",
    message: "Route not found.",
    data: null,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Gateway is running on port ${PORT}`);
});
