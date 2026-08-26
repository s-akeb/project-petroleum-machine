const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./database/db');
const config = require('./config');
const { fail } = require('./helper/apiResponse');
const userModel = require('./models/userModel');
const staticModel = require('./models/staticModel');

const app = express();
const port = config.port;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/user', require('./router/userRouter'));
app.use('/admin', require('./router/adminRouter'));
app.use('/machine', require('./router/machineRouter'));
app.use('/static', require('./router/staticRouter'));

const swaggerSpec = swaggerJSDoc({
    swaggerDefinition: {
        info: {
            title: 'Petroleum Machine API',
            version: '1.0.0',
            description: 'User, Admin, Machine and Static APIs with JWT auth.',
        },
        host: `localhost:${port}`,
        basePath: '/',
        schemes: ['http'],
        securityDefinitions: {
            token: {
                type: 'apiKey',
                name: 'token',
                in: 'header',
            },
        },
    },
    apis: ['./router/*.js'],
});

app.get('/swagger.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

app.get('/health', (_req, res) => {
    res.json({
        responseCode: 200,
        responseMessage: 'OK',
        responseResult: { uptime: process.uptime() },
    });
});

app.use((req, res) => fail(res, 404, `Route not found: ${req.method} ${req.originalUrl}`));

app.use((err, _req, res, _next) => {
    console.error(err);
    return fail(res, 500, 'Something went wrong.', err.message);
});

const start = async () => {
    try {
        await connectDB();
        await userModel.seedDefaultAdmin();
        await staticModel.seedStaticContent();
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
            console.log(`Swagger UI: http://localhost:${port}/api-docs`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

start();
