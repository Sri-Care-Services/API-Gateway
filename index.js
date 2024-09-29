const express = require('express');
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("combined"));
app.disable("x-powered-by");
app.use(express.json()); // Middleware to parse JSON bodies

// Define the services with proper target paths
const services = [
    // Billing (Port 8081)
    {
        route: "/makePayment",
        target: "http://localhost:8081"
    },
    {
        route: "/createBillingDetails",
        target: "http://localhost:8081/api/billing/details",
        method: "POST"
    },
    {
        route: "/getBillingDetails",
        target: "http://localhost:8081/api/billing/details",
        method: "GET"
    },
    {
        route: "/updateBillingDetails",
        target: "http://localhost:8081"
    },
    {
        route: "/getPaymentHistory",
        target: "http://localhost:8081"
    },

    // Notification (Port 8082)
    {
        route: "/sendEmail",
        target: "http://localhost:8082"
    },
    {
        route: "/sendNotification",
        target: "http://localhost:8082"
    },
    {
        route: "/sendSMS",
        target: "http://localhost:8082"
    },
    {
        route: "/sendBroadcastNotification",
        target: "http://localhost:8082"
    },

    // User Management (Port 8080)
    {
        route: "/register",
        target: "http://localhost:8080"
    },
    {
        route: "/login",
        target: "http://localhost:8080"
    },
    {
        route: "/getAllUsers",
        target: "http://localhost:8080"
    },
    {
        route: "/getUserById",
        target: "http://localhost:8080"
    },
    {
        route: "/deleteUser",
        target: "http://localhost:8080"
    },
    {
        route: "/updateUser",
        target: "http://localhost:8080"
    },
    {
        route: "/getPhoneNumber",
        target: "http://localhost:8080"
    },
    {
        route: "/getEmail",
        target: "http://localhost:8080"
    },
    {
        route: "/getCustomersList",
        target: "http://localhost:8080"
    },

    // Service Activation/Deactivation (Port 8083)
    {
        route: "/registerPackage",
        target: "http://localhost:8083"
    },
    {
        route: "/updatePackage",
        target: "http://localhost:8083"
    },
    {
        route: "/getAllPackages",
        target: "http://localhost:8083"
    },
    {
        route: "/getActivePackages",
        target: "http://localhost:8083"
    },
    {
        route: "/activatePackage",
        target: "http://localhost:8083"
    },

    // Chat (Port 8084)
    {
        route: "/sendMessage",
        target: "http://localhost:8084"
    },
    {
        route: "/createChat",
        target: "http://localhost:8084"
    },
    {
        route: "/viewChats",
        target: "http://localhost:8084"
    },
    {
        route: "/getMessageHistory",
        target: "http://localhost:8084"
    }
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

// Use the services array to set up the proxy
services.forEach(({ route, target, method }) => {
    const proxyOptions = {
        target,
        changeOrigin: true,
        pathRewrite: {
            [`^${route}`]: "", // Remove the route part from the path
        },
        onProxyReq: (proxyReq, req, res) => {
            if (method) {
                proxyReq.method = method; // Set method if specified
            }
        },
        onError: (err, req, res) => {
            console.error('Proxy error:', err); // Log the error
            res.status(500).json({
                code: 500,
                status: "Error",
                message: "Proxy error occurred.",
                data: null,
            });
        }
    };

    app.use(route, createProxyMiddleware(proxyOptions));
});

// Catch-all route for 404
app.use((req, res) => {
    const service = services.find(service => req.path.startsWith(service.route));
    const targetPath = service ? service.target : 'Not defined';
    
    res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: "Not Found",
        path: targetPath,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Gateway is running on port ${PORT}`);
});
