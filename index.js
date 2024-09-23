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

const services = [
    // Billing (Port 8081)
    {
        route: "/makePayment",
        target: "http://localhost:8081/makePayment"
    },
    {
        route: "/createBillingDetails",
        target: "http://localhost:8081/createBillingDetails"
    },
    {
        route: "/getBillingDetails",
        target: "http://localhost:8081/getBillingDetails"
    },
    {
        route: "/updateBillingDetails",
        target: "http://localhost:8081/updateBillingDetails"
    },
    {
        route: "/getPaymentHistory",
        target: "http://localhost:8081/getPaymentHistory"
    },

    // Notification (Port 8082)
    {
        route: "/sendEmail",
        target: "http://localhost:8082/sendEmail"
    },
    {
        route: "/sendNotification",
        target: "http://localhost:8082/sendNotification"
    },
    {
        route: "/sendSMS",
        target: "http://localhost:8082/sendSMS"
    },
    {
        route: "/sendBroadcastNotification",
        target: "http://localhost:8082/sendBroadcastNotification"
    },

    // User Management (Port 8080)
    {
        route: "/register",
        target: "http://localhost:8080/register"
    },
    {
        route: "/login",
        target: "http://localhost:8080/login"
    },
    {
        route: "/getAllUsers",
        target: "http://localhost:8080/getAllUsers"
    },
    {
        route: "/getUserById",
        target: "http://localhost:8080/getUserById"
    },
    {
        route: "/deleteUser",
        target: "http://localhost:8080/deleteUser"
    },
    {
        route: "/updateUser",
        target: "http://localhost:8080/updateUser"
    },
    {
        route: "/getPhoneNumber",
        target: "http://localhost:8080/getPhoneNumber"
    },
    {
        route: "/getEmail",
        target: "http://localhost:8080/getEmail"
    },
    {
        route: "/getCustomersList",
        target: "http://localhost:8080/getCustomersList"
    },

    // Service Activation/Deactivation (Port 8083)
    {
        route: "/registerPackage",
        target: "http://localhost:8083/registerPackage"
    },
    {
        route: "/updatePackage",
        target: "http://localhost:8083/updatePackage"
    },
    {
        route: "/getAllPackages",
        target: "http://localhost:8083/getAllPackages"
    },
    {
        route: "/getActivePackages",
        target: "http://localhost:8083/getActivePackages"
    },
    {
        route: "/activatePackage",
        target: "http://localhost:8083/activatePackage"
    },

    // Chat (Port 8084)
    {
        route: "/sendMessage",
        target: "http://localhost:8084/sendMessage"
    },
    {
        route: "/createChat",
        target: "http://localhost:8084/createChat"
    },
    {
        route: "/viewChats",
        target: "http://localhost:8084/viewChats"
    },
    {
        route: "/getMessageHistory",
        target: "http://localhost:8084/getMessageHistory"
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


services.forEach(({ route, target }) => {

    const proxyOptions = {
        target,
        changeOrigin: true,
        pathRewrite: {
            [`^${route}`]: "",
        },
    };


    app.use(route, rateLimitAndTimeout, createProxyMiddleware(proxyOptions));
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