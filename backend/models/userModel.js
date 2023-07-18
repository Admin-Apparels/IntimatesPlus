const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const femaleUserSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, required: true },
    value: { type: String, required: true },
    pic: {
      type: String,

      default:
        "https://avatars.githubusercontent.com/u/124874019?s=400&u=3534faadd406a1ca5df59e1c31294869a2463737&v=4",
    },
  },
  {
    timestamps: true,
  }
);

femaleUserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

femaleUserSchema.pre("save", async function (next) {
  if (!this.isModified) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const maleUserSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: { type: String, required: true },
    pic: {
      type: String,
      default:
        "https://avatars.githubusercontent.com/u/124874019?s=400&u=3534faadd406a1ca5df59e1c31294869a2463737&v=4",
    },
  },
  {
    timestamps: true,
  }
);

maleUserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

maleUserSchema.pre("save", async function (next) {
  if (!this.isModified) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const FemaleUser = mongoose.model("FemaleUser", femaleUserSchema);
const MaleUser = mongoose.model("MaleUser", maleUserSchema);

module.exports = { FemaleUser, MaleUser };
