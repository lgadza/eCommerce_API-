import express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import mongoose from "mongoose";
// import blogPostRouter from "./api/blogPost/index.js";
import productRouter from "./api/products/index.js";
import usersRouter from "./api/testProject/index.js";
import {
  badRequestHandler,
  notFoundHandler,
  genericErrorHandler,
} from "./errorHandler.js";

const server = express();
const port = process.env.PORT || 3001;

// ******************************* MIDDLEWARES ****************************************
server.use(express.json());
const whitelist = [process.env.FE_DEV_URL];

const corsOpts = {
  origin: (origin, corsNext) => {
    console.log("CURRENT ORIGIN: ", origin);
    if (!origin || whitelist.indexOf(origin) !== -1) {
      corsNext(null, true);
    } else {
      corsNext(
        createHttpError(400, `Origin ${origin} is not in the whitelist!`)
      );
    }
  },
};

server.use(cors(corsOpts));

// ******************************** ENDPOINTS *****************************************
// server.use("/blogPosts", blogPostRouter);
server.use("/products", productRouter);
server.use("/users", usersRouter);

// ***************************** ERROR HANDLERS ***************************************
server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("Successfully connected to Mongo!");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`Server is running on port ${port}`);
  });
});
