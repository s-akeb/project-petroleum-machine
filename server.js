const express = require("express");
const db = require("./database/db");
const app = express();
const port = 8888;
const userRouter = require("./router/userRouter");
const machineRouter = require('./router/machineRouter');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/user", userRouter);
app.use("/admin", userRouter);
app.use("/admin", machineRouter);
app.use('/static', require('./router/staticRouter'));
const swaggerDefinition = {
    info: {
        title: "API NODE",
        version: "1.0.0",
        description: "Swagger API Docs",
    },
    host: `localhost:${port}`,
    basePath: "/",
};
const options = {
    swaggerDefinition: swaggerDefinition,
    apis: ["./router/*.js"],
};
const swaggerSpec = swaggerJSDoc(options);
app.get("/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
});

/** Server Listen **/
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(port, (err, result) => {
    if (err) {
        console.log("Internal server error", err);
    }
    else {
        console.log("Server is listing on port", port)
    }
});
