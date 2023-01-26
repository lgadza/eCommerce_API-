import express from "express";
import createHttpError from "http-errors";
import usersModel from "./model.js";
// import

const usersRouter = express.Router();
usersRouter.post("/", async (req, res, next) => {
  try {
    const user = new usersModel(req.body);
    const { _id } = await user.save();
    res.send({ _id });
  } catch (error) {
    // console.log(error)
    next(error);
  }
});
usersRouter.put("/:userId/address", async (req, res, next) => {
  //   const newAddress = req.body;
  //   const user = usersModel.findByIdAndUpdate(
  //     req.params.userId,
  //     { $push: { aaddresses: newAddress } },
  //     { new: true, runValidators: true }
  //   );
  //   if (user) {
  //     res.send(user);
  //   } else {
  //     next(createHttpError(404, `User with id ${req.params.userId} not found`));
  //   }
  try {
    // const user = new AaddressesModel(req.body);

    const user = req.body;

    if (user) {
      const newAddress = {
        ...req.body,
        commentDate: new Date(),
      };

      const updatedUsers = await usersModel.findByIdAndUpdate(
        req.params.userId,
        { $push: { addresses: newAddress } },
        { new: true, runValidators: true }
      );

      if (updatedUsers) {
        res.send(updatedUsers);
      } else {
        next(
          createHttpError(404, `Users with id ${req.params.usersId} not found!`)
        );
      }
    } else {
      next(
        createHttpError(404, `Users with id ${req.body.usersId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});
usersRouter.delete("/:userId/address/:addressId", async (req, res, next) => {
  try {
    const users = await usersModel.findByIdAndUpdate(
      req.params.userId,
      { $pull: { addresses: { _id: req.params.addressId } } },
      { new: true }
    );
    if (users) {
      res.send(users);
    } else {
      next(
        createHttpError(404, `User with id ${req.params.userId} not found!`)
      );
    }
  } catch (error) {
    next(error);
  }
});
export default usersRouter;
